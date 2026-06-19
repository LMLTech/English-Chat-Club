package com.ecc.session.application.service;

import com.ecc.common.event.BookingConfirmedEvent;
import com.ecc.common.exception.BadRequestException;
import com.ecc.common.exception.ResourceNotFoundException;
import com.ecc.session.api.dto.request.SessionRequest;
import com.ecc.session.api.dto.response.BookingResponse;
import com.ecc.session.application.port.in.ManageSessionUseCase;
import com.ecc.session.application.port.out.BookingRepositoryPort;
import com.ecc.session.application.port.out.SessionRepositoryPort;
import com.ecc.session.application.port.out.TopicRepositoryPort;
import com.ecc.session.application.port.out.WaitingListRepositoryPort;
import com.ecc.session.domain.model.Booking;
import com.ecc.session.domain.model.DiscussionTopic;
import com.ecc.session.domain.model.Session;
import com.ecc.session.domain.model.WaitingList;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService implements ManageSessionUseCase {

    // Thứ tự CEFR từ thấp đến cao để so sánh trình độ
    private static final List<String> CEFR_ORDER = List.of("A1", "A2", "B1", "B2", "C1", "C2");

    private final SessionRepositoryPort sessionRepositoryPort;
    private final TopicRepositoryPort topicRepositoryPort;
    private final BookingRepositoryPort bookingRepositoryPort;
    private final WaitingListRepositoryPort waitingListRepositoryPort;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public Session createSession(Long moderatorId, SessionRequest request) {
        // 1. Kiểm tra thời gian hợp lệ
        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().isEqual(request.getStartTime())) {
            throw new BadRequestException("Thời gian kết thúc phải diễn ra sau thời gian bắt đầu");
        }

        // 2. Tìm Topic
        DiscussionTopic topic = topicRepositoryPort.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ đề thảo luận"));

        if (!topic.getIsActive() || topic.getDeletedAt() != null) {
            throw new BadRequestException("Chủ đề này đang bị ẩn hoặc đã bị xóa, không thể tạo phòng");
        }

        // 3. Khởi tạo Session chuẩn Database Schema
        Session session = Session.builder()
                .uuid(UUID.randomUUID())
                .topic(topic)
                .moderatorId(moderatorId)
                .title(request.getTitle())
                .description(request.getDescription())
                .coverImage(request.getCoverImage())
                .maxParticipants(request.getMaxParticipants())
                .currentParticipants(0) // Mới tạo chưa ai vào
                .requiredLevel(request.getRequiredLevel())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status("SCHEDULED")
                .roomStatus("PENDING_APPROVAL") // Cần Admin duyệt theo Flow 2.2
                .build();

        return sessionRepositoryPort.save(session);
    }

    @Override
    @Transactional
    public Session approveSession(Long sessionId) {
        Session session = sessionRepositoryPort.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng hội thoại"));

        if (!"PENDING_APPROVAL".equals(session.getRoomStatus())) {
            throw new BadRequestException("Phòng này không ở trạng thái chờ duyệt");
        }

        session.setRoomStatus("APPROVED");
        return sessionRepositoryPort.save(session);
    }

    /**
     * Flow 2.3 – Đặt chỗ (Member)
     * Chiến lược concurrency: Atomic DB UPDATE (tránh race condition mà không lock cả row Session).
     * Thông tin user (status, cefrLevel) được đọc từ JWT claims – không query DB chéo module.
     */
    @Override
    @Transactional
    public BookingResponse bookSession(Long memberId, Long sessionId, String memberStatus, String memberCefrLevel) {

        // ── 1. Tải Session và kiểm tra trạng thái ──────────────────────────────
        Session session = sessionRepositoryPort.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng hội thoại"));

        if (!"APPROVED".equals(session.getRoomStatus())) {
            throw new BadRequestException("Phòng hội thoại chưa được duyệt hoặc đã bị đóng");
        }
        if (!"SCHEDULED".equals(session.getStatus())) {
            throw new BadRequestException("Phòng hội thoại này không còn nhận đặt chỗ (trạng thái: " + session.getStatus() + ")");
        }

        // ── 2. Kiểm tra user ACTIVE (từ JWT claim) ─────────────────────────────
        if (!"ACTIVE".equals(memberStatus)) {
            throw new BadRequestException("Tài khoản của bạn chưa được kích hoạt hoặc đang bị khóa");
        }

        // ── 3. Kiểm tra requiredLevel ───────────────────────────────────────────
        String requiredLevel = session.getRequiredLevel();
        if (requiredLevel != null && !requiredLevel.isBlank()) {
            int requiredIdx = CEFR_ORDER.indexOf(requiredLevel.toUpperCase());
            int memberIdx   = memberCefrLevel != null ? CEFR_ORDER.indexOf(memberCefrLevel.toUpperCase()) : -1;

            if (memberIdx < requiredIdx) {
                throw new BadRequestException(
                    "Trình độ của bạn (" + memberCefrLevel + ") chưa đủ. Yêu cầu tối thiểu: " + requiredLevel);
            }
        }

        // ── 4. Kiểm tra trùng lịch ─────────────────────────────────────────────
        boolean hasConflict = sessionRepositoryPort.hasConflictingBooking(
                memberId, session.getStartTime(), session.getEndTime(), sessionId);
        if (hasConflict) {
            throw new BadRequestException("Bạn đã có lịch hội thoại khác trùng khung giờ này");
        }

        // ── 5. Kiểm tra duplicate booking ──────────────────────────────────────
        bookingRepositoryPort.findActiveByMemberIdAndSessionId(memberId, sessionId).ifPresent(b -> {
            throw new BadRequestException("Bạn đã đặt chỗ trong phòng hội thoại này rồi");
        });

        // ── 6. Thử tăng số chỗ (Atomic – tránh race condition) ─────────────────
        int rowsAffected = sessionRepositoryPort.tryIncrementParticipants(sessionId);

        if (rowsAffected == 1) {
            // ── 6a. Thành công → tạo Booking CONFIRMED ─────────────────────────
            Booking booking = Booking.builder()
                    .uuid(UUID.randomUUID())
                    .memberId(memberId)
                    .session(session)
                    .status("CONFIRMED")
                    .build();
            booking = bookingRepositoryPort.save(booking);

            // Publish event để các module khác lắng nghe (notification, gamification,...)
            eventPublisher.publishEvent(new BookingConfirmedEvent(booking.getId(), sessionId, memberId));

            return BookingResponse.builder()
                    .bookingId(booking.getId())
                    .bookingUuid(booking.getUuid().toString())
                    .sessionId(sessionId)
                    .sessionTitle(session.getTitle())
                    .memberId(memberId)
                    .status("CONFIRMED")
                    .waitingPosition(null)
                    .createdAt(booking.getCreatedAt())
                    .build();

        } else {
            // ── 6b. Phòng đầy → thêm vào Waiting List ──────────────────────────
            if (waitingListRepositoryPort.existsByMemberIdAndSessionId(memberId, sessionId)) {
                throw new BadRequestException("Phòng đã đầy và bạn đang có trong danh sách chờ rồi");
            }

            // Position = max position hiện tại + 1 (FIFO)
            int nextPosition = waitingListRepositoryPort.countBySessionId(sessionId) + 1;

            WaitingList waitingEntry = WaitingList.builder()
                    .memberId(memberId)
                    .session(session)
                    .position(nextPosition)
                    .status("WAITING")
                    .build();
            waitingEntry = waitingListRepositoryPort.save(waitingEntry);

            return BookingResponse.builder()
                    .bookingId(waitingEntry.getId())
                    .bookingUuid(null) // WaitingList không có UUID
                    .sessionId(sessionId)
                    .sessionTitle(session.getTitle())
                    .memberId(memberId)
                    .status("WAITING")
                    .waitingPosition(nextPosition)
                    .createdAt(waitingEntry.getCreatedAt())
                    .build();
        }
    }
}