package com.ecc.session.application.service;

import com.ecc.common.event.BookingCancelledEvent;
import com.ecc.common.event.BookingConfirmedEvent;
import com.ecc.common.event.LateBookingCancelEvent;
import com.ecc.common.exception.BadRequestException;
import com.ecc.common.exception.ResourceNotFoundException;
import com.ecc.session.api.dto.request.SessionRequest;
import com.ecc.session.api.dto.response.BookingResponse;
import com.ecc.session.application.port.in.ManageSessionUseCase;
import com.ecc.session.application.port.out.BookingRepositoryPort;
import com.ecc.session.application.port.out.PointsPort;
import com.ecc.session.application.port.out.SessionRepositoryPort;
import com.ecc.session.application.port.out.TopicRepositoryPort;
import com.ecc.session.application.port.out.WaitingListRepositoryPort;
import com.ecc.session.domain.model.Booking;
import com.ecc.session.domain.model.DiscussionTopic;
import com.ecc.session.domain.model.Session;
import com.ecc.session.domain.model.WaitingList;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionService implements ManageSessionUseCase {

    // Thứ tự CEFR từ thấp đến cao để so sánh trình độ
    private static final List<String> CEFR_ORDER = List.of("A1", "A2", "B1", "B2", "C1", "C2");

    // Nếu hủy trong vòng 2h trước giờ bắt đầu → phạt điểm
    private static final int LATE_CANCEL_THRESHOLD_HOURS = 2;
    private static final int LATE_CANCEL_PENALTY_POINTS  = 5;

    // Người được promote có 1 phút để xác nhận (TEST MODE – đổi lại 10 khi deploy)
    private static final int PROMOTE_CONFIRM_MINUTES = 10;

    private final SessionRepositoryPort sessionRepositoryPort;
    private final TopicRepositoryPort topicRepositoryPort;
    private final BookingRepositoryPort bookingRepositoryPort;
    private final WaitingListRepositoryPort waitingListRepositoryPort;
    private final PointsPort pointsPort;
    private final ApplicationEventPublisher eventPublisher;

    // ═══════════════════════════════════════════════════════════════════════
    // Flow 2.2 – Tạo Session (Moderator)
    // ═══════════════════════════════════════════════════════════════════════
    @Override
    @Transactional
    public Session createSession(Long moderatorId, SessionRequest request) {
        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().isEqual(request.getStartTime())) {
            throw new BadRequestException("Thời gian kết thúc phải diễn ra sau thời gian bắt đầu");
        }

        DiscussionTopic topic = topicRepositoryPort.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ đề thảo luận"));

        if (!topic.getIsActive() || topic.getDeletedAt() != null) {
            throw new BadRequestException("Chủ đề này đang bị ẩn hoặc đã bị xóa, không thể tạo phòng");
        }

        Session session = Session.builder()
                .uuid(UUID.randomUUID())
                .topic(topic)
                .moderatorId(moderatorId)
                .title(request.getTitle())
                .description(request.getDescription())
                .coverImage(request.getCoverImage())
                .maxParticipants(request.getMaxParticipants())
                .currentParticipants(0)
                .requiredLevel(request.getRequiredLevel())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status("SCHEDULED")
                .roomStatus("PENDING_APPROVAL")
                .build();

        return sessionRepositoryPort.save(session);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Flow 2.2 – Duyệt Session (Admin)
    // ═══════════════════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════════════════
    // Flow 2.3 – Đặt chỗ (Member)
    // ═══════════════════════════════════════════════════════════════════════
    @Override
    @Transactional
    public BookingResponse bookSession(Long memberId, Long sessionId, String memberStatus, String memberCefrLevel) {

        // 1. Tải Session và kiểm tra trạng thái
        Session session = sessionRepositoryPort.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng hội thoại"));

        if (!"APPROVED".equals(session.getRoomStatus())) {
            throw new BadRequestException("Phòng hội thoại chưa được duyệt hoặc đã bị đóng");
        }
        if (!"SCHEDULED".equals(session.getStatus())) {
            throw new BadRequestException("Phòng hội thoại này không còn nhận đặt chỗ (trạng thái: " + session.getStatus() + ")");
        }

        // 2. Kiểm tra user ACTIVE (từ JWT claim)
        if (!"ACTIVE".equals(memberStatus)) {
            throw new BadRequestException("Tài khoản của bạn chưa được kích hoạt hoặc đang bị khóa");
        }

        // 3. Kiểm tra requiredLevel
        String requiredLevel = session.getRequiredLevel();
        if (requiredLevel != null && !requiredLevel.isBlank()) {
            int requiredIdx = CEFR_ORDER.indexOf(requiredLevel.toUpperCase());
            int memberIdx   = memberCefrLevel != null ? CEFR_ORDER.indexOf(memberCefrLevel.toUpperCase()) : -1;
            if (memberIdx < requiredIdx) {
                throw new BadRequestException(
                        "Trình độ của bạn (" + memberCefrLevel + ") chưa đủ. Yêu cầu tối thiểu: " + requiredLevel);
            }
        }

        // 4. Kiểm tra trùng lịch
        if (sessionRepositoryPort.hasConflictingBooking(memberId, session.getStartTime(), session.getEndTime(), sessionId)) {
            throw new BadRequestException("Bạn đã có lịch hội thoại khác trùng khung giờ này");
        }

        // 5. Kiểm tra duplicate booking
        bookingRepositoryPort.findActiveByMemberIdAndSessionId(memberId, sessionId).ifPresent(b -> {
            throw new BadRequestException("Bạn đã đặt chỗ trong phòng hội thoại này rồi");
        });

        // 6. Thử tăng số chỗ (Atomic – tránh race condition)
        int rowsAffected = sessionRepositoryPort.tryIncrementParticipants(sessionId);

        if (rowsAffected == 1) {
            // 6a. Thành công → tạo Booking CONFIRMED
            Booking booking = Booking.builder()
                    .uuid(UUID.randomUUID())
                    .memberId(memberId)
                    .session(session)
                    .status("CONFIRMED")
                    .build();
            booking = bookingRepositoryPort.save(booking);
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
            // 6b. Phòng đầy → thêm vào Waiting List
            if (waitingListRepositoryPort.existsByMemberIdAndSessionId(memberId, sessionId)) {
                throw new BadRequestException("Phòng đã đầy và bạn đang có trong danh sách chờ rồi");
            }

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
                    .bookingUuid(null)
                    .sessionId(sessionId)
                    .sessionTitle(session.getTitle())
                    .memberId(memberId)
                    .status("WAITING")
                    .waitingPosition(nextPosition)
                    .createdAt(waitingEntry.getCreatedAt())
                    .build();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Flow 2.4 – Hủy chỗ (Member)
    // ═══════════════════════════════════════════════════════════════════════
    @Override
    @Transactional
    public BookingResponse cancelBooking(Long memberId, Long sessionId) {

        // 1. Tìm booking CONFIRMED của member trong session
        Booking booking = bookingRepositoryPort
                .findActiveByMemberIdAndSessionId(memberId, sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Bạn không có đặt chỗ CONFIRMED trong phòng hội thoại này"));

        // 2. Tải session
        Session session = sessionRepositoryPort.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng hội thoại"));

        if ("COMPLETED".equals(session.getStatus()) || "CANCELLED".equals(session.getStatus())) {
            throw new BadRequestException("Không thể hủy chỗ trong phòng đã kết thúc hoặc bị hủy");
        }

        // 3. Kiểm tra late cancel (trong vòng 2h trước giờ bắt đầu)
        boolean isLateCancel = LocalDateTime.now()
                .isAfter(session.getStartTime().minusHours(LATE_CANCEL_THRESHOLD_HOURS));

        if (isLateCancel) {
            log.info("[Flow 2.4] Late cancel: memberId={}, sessionId={} → deduct {} points",
                    memberId, sessionId, LATE_CANCEL_PENALTY_POINTS);
            pointsPort.deductPoints(memberId, LATE_CANCEL_PENALTY_POINTS, "LATE_CANCEL");
            eventPublisher.publishEvent(new LateBookingCancelEvent(memberId, sessionId, LATE_CANCEL_PENALTY_POINTS));
        }

        // 4. Đánh dấu booking là CANCELLED
        booking.setStatus("CANCELLED");
        bookingRepositoryPort.save(booking);

        // 5. Giảm số chỗ atomic
        sessionRepositoryPort.tryDecrementParticipants(sessionId);

        // 6. Publish cancel event
        eventPublisher.publishEvent(new BookingCancelledEvent(booking.getId(), sessionId, memberId));

        // 7. Promote người đầu hàng chờ → PENDING_CONFIRM (10 phút)
        waitingListRepositoryPort.findFirstWaitingBySessionId(sessionId).ifPresent(waitingEntry -> {
            waitingEntry.setStatus("PENDING_CONFIRM");
            waitingEntry.setConfirmDeadline(LocalDateTime.now().plusMinutes(PROMOTE_CONFIRM_MINUTES));
            waitingListRepositoryPort.save(waitingEntry);

            log.info("[Flow 2.4] Promoted to PENDING_CONFIRM: memberId={}, sessionId={}, deadline={}",
                    waitingEntry.getMemberId(), sessionId, waitingEntry.getConfirmDeadline());
            // TODO: Gửi notification cho waitingEntry.getMemberId() (khi có notification module)
        });

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .bookingUuid(booking.getUuid().toString())
                .sessionId(sessionId)
                .sessionTitle(session.getTitle())
                .memberId(memberId)
                .status("CANCELLED")
                .waitingPosition(null)
                .createdAt(booking.getCreatedAt())
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Flow 2.4 – Xác nhận promote (Member được promote)
    // ═══════════════════════════════════════════════════════════════════════
    @Override
    @Transactional
    public BookingResponse confirmPromotion(Long memberId, Long sessionId) {

        // 1. Tìm entry PENDING_CONFIRM của member
        WaitingList waitingEntry = waitingListRepositoryPort
                .findPendingConfirmByMemberIdAndSessionId(memberId, sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy yêu cầu xác nhận. Bạn chưa được promote hoặc đã hết thời gian."));

        // 2. Kiểm tra deadline
        if (LocalDateTime.now().isAfter(waitingEntry.getConfirmDeadline())) {
            throw new BadRequestException(
                    "Thời gian xác nhận đã hết hạn (" + PROMOTE_CONFIRM_MINUTES + " phút). Vui lòng thử lại sau.");
        }

        // 3. Tải session
        Session session = sessionRepositoryPort.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng hội thoại"));

        // 4. Đánh dấu PROMOTED
        waitingEntry.setStatus("PROMOTED");
        waitingListRepositoryPort.save(waitingEntry);

        // 5. Tạo Booking CONFIRMED
        Booking booking = Booking.builder()
                .uuid(UUID.randomUUID())
                .memberId(memberId)
                .session(session)
                .status("CONFIRMED")
                .build();
        booking = bookingRepositoryPort.save(booking);

        // 6. Tăng lại số chỗ
        sessionRepositoryPort.tryIncrementParticipants(sessionId);

        // 7. Publish event
        eventPublisher.publishEvent(new BookingConfirmedEvent(booking.getId(), sessionId, memberId));

        log.info("[Flow 2.4] Promotion confirmed: memberId={}, sessionId={}, bookingId={}",
                memberId, sessionId, booking.getId());

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
    }

    @Override
    @Transactional(readOnly = true)
    public List<Session> getAvailableSessions() {
        return sessionRepositoryPort.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public com.ecc.session.api.dto.response.HandSignalResponse handleHandSignal(Long sessionId, Long senderId, com.ecc.session.api.dto.request.HandSignalRequest request) {
        Session session = sessionRepositoryPort.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Phòng không tồn tại"));

        boolean isModerator = session.getModeratorId().equals(senderId);
        Long affectedUserId = senderId;
        String displayMessage = "";

        if (request.getAction().equals("APPROVE") || request.getAction().equals("REJECT") || request.getAction().equals("MUTE")) {
            if (!isModerator) {
                throw new BadRequestException("Chỉ Moderator mới có quyền cấp hoặc tắt Mic.");
            }
            affectedUserId = request.getTargetUserId();
            displayMessage = "Moderator đã " + request.getAction() + " mic của User " + affectedUserId;
        } else {
            displayMessage = "User " + affectedUserId + " đã " + request.getAction() + " tay.";
        }

        return com.ecc.session.api.dto.response.HandSignalResponse.builder()
                .sessionId(sessionId)
                .userId(affectedUserId)
                .action(request.getAction())
                .message(displayMessage)
                .build();
    }
}