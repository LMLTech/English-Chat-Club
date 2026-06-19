package com.ecc.session.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.common.exception.ResourceNotFoundException;
import com.ecc.session.api.dto.request.SessionRequest;
import com.ecc.session.application.port.in.ManageSessionUseCase;
import com.ecc.session.application.port.out.SessionRepositoryPort;
import com.ecc.session.application.port.out.TopicRepositoryPort;
import com.ecc.session.domain.model.DiscussionTopic;
import com.ecc.session.domain.model.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService implements ManageSessionUseCase {

    private final SessionRepositoryPort sessionRepositoryPort;
    private final TopicRepositoryPort topicRepositoryPort;

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
}