package com.ecc.session.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.session.api.dto.request.ChatMessageRequest;
import com.ecc.session.api.dto.response.ChatMessageResponse;
import com.ecc.session.application.port.out.BookingRepositoryPort;
import com.ecc.session.domain.model.ChatMessage;
import com.ecc.session.domain.model.Session;
import com.ecc.session.infrastructure.adapter.ChatMessageRedisAdapter;
import com.ecc.session.infrastructure.repository.ChatMessageRepository;
import com.ecc.session.infrastructure.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final SessionRepository sessionRepository;
    private final BookingRepositoryPort bookingRepositoryPort;
    private final ChatMessageRedisAdapter chatMessageRedisAdapter;

    @Transactional
    public ChatMessageResponse processAndSaveMessage(Long sessionId, Long senderId, ChatMessageRequest request) {
        // 1. Kiểm tra session có tồn tại và đang diễn ra không
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Phòng không tồn tại"));

        // 2. Kiểm tra quyền chat: Phải là Moderator hoặc có Booking CONFIRMED
        boolean isModerator = session.getModeratorId().equals(senderId);
        boolean isConfirmedMember = bookingRepositoryPort.findActiveByMemberIdAndSessionId(senderId, sessionId).isPresent();

        if (!isModerator && !isConfirmedMember) {
            throw new BadRequestException("Bạn không có quyền chat trong phòng này");
        }

        // TODO: Chèn logic gọi BadWordFilter ở đây (sẽ làm ở Phase 5) nha

        // 3. Lưu MySQL
        ChatMessage chatMessage = ChatMessage.builder()
                .uuid(UUID.randomUUID())
                .session(session)
                .senderId(senderId)
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : "TEXT")
                .build();

        chatMessage = chatMessageRepository.save(chatMessage);

        // 4. Map sang Response
        ChatMessageResponse response = ChatMessageResponse.builder()
                .uuid(chatMessage.getUuid().toString())
                .sessionId(sessionId)
                .senderId(senderId)
                .content(chatMessage.getContent())
                .type(chatMessage.getType())
                .createdAt(chatMessage.getCreatedAt())
                .build();

        // 5. Lưu vào Redis Cache để lấy lịch sử siêu tốc
        chatMessageRedisAdapter.saveMessageToCache(sessionId, response);

        return response;
    }
}