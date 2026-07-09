package com.ecc.session.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.common.util.BadWordFilter;
import com.ecc.session.api.dto.request.ChatMessageRequest;
import com.ecc.session.api.dto.response.ChatMessageResponse;
import com.ecc.session.application.port.out.BookingRepositoryPort;
import com.ecc.session.application.port.out.IdentityPort;
import com.ecc.session.domain.model.ChatMessage;
import com.ecc.session.domain.model.Session;
import com.ecc.session.infrastructure.adapter.ChatMessageRedisAdapter;
import com.ecc.session.infrastructure.repository.ChatMessageRepository;
import com.ecc.session.infrastructure.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final SessionRepository sessionRepository;
    private final BookingRepositoryPort bookingRepositoryPort;
    private final ChatMessageRedisAdapter chatMessageRedisAdapter;
    private final IdentityPort identityPort;
    private final BadWordFilter badWordFilter; // Port: Bộ lọc từ cấm

    @Transactional
    public ChatMessageResponse processAndSaveMessage(Long sessionId, Long senderId, ChatMessageRequest request) {
        // 1. Kiểm tra session có tồn tại và đang diễn ra không
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Phòng không tồn tại"));

        // 2. Kiểm tra xem User có đang bị BANNED không
        if (identityPort.isUserBanned(senderId)) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa, không thể gửi tin nhắn!");
        }

        // 3. Kiểm tra quyền chat: Phải là Moderator hoặc có Booking CONFIRMED
        boolean isModerator = session.getModeratorId().equals(senderId);
        boolean isConfirmedMember = bookingRepositoryPort.findActiveByMemberIdAndSessionId(senderId, sessionId).isPresent();

        if (!isModerator && !isConfirmedMember) {
            throw new BadRequestException("Bạn không có quyền chat trong phòng này");
        }

        // 4. Lọc từ cấm: Thay thế nội dung vi phạm bằng ***
        String filteredContent = badWordFilter.filter(request.getContent());
        if (!filteredContent.equals(request.getContent())) {
            log.info("BadWordFilter đã lọc tin nhắn của User {} trong Session {}", senderId, sessionId);
        }

        // 5. Lưu MySQL
        ChatMessage chatMessage = ChatMessage.builder()
                .uuid(UUID.randomUUID())
                .session(session)
                .senderId(senderId)
                .content(filteredContent)
                .type(request.getType() != null ? request.getType() : "TEXT")
                .build();

        chatMessage = chatMessageRepository.save(chatMessage);

        // 6. Map sang Response
        ChatMessageResponse response = ChatMessageResponse.builder()
                .uuid(chatMessage.getUuid().toString())
                .sessionId(sessionId)
                .senderId(senderId)
                .content(chatMessage.getContent())
                .type(chatMessage.getType())
                .createdAt(chatMessage.getCreatedAt())
                .deletedAt(chatMessage.getDeletedAt())
                .isPinned(chatMessage.getIsPinned())
                .build();

        // 7. Lưu vào Redis Cache để lấy lịch sử siêu tốc
        chatMessageRedisAdapter.saveMessageToCache(sessionId, response);

        return response;
    }

    @Transactional
    public void deleteMessage(Long messageId, Long requesterId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new BadRequestException("Tin nhắn không tồn tại"));

        Session session = message.getSession();
        if (!session.getModeratorId().equals(requesterId) && !message.getSenderId().equals(requesterId)) {
            throw new BadRequestException("Bạn không có quyền xóa tin nhắn này");
        }

        message.setDeletedAt(java.time.LocalDateTime.now());
        chatMessageRepository.save(message);

        // Xóa cache của phòng này để API get lịch sử sẽ fallback về DB và loại bỏ tin nhắn này
        chatMessageRedisAdapter.clearCache(session.getId());
    }

    @Transactional
    public void pinMessage(Long messageId, Long requesterId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new BadRequestException("Tin nhắn không tồn tại"));

        Session session = message.getSession();
        if (!session.getModeratorId().equals(requesterId)) {
            throw new BadRequestException("Chỉ Moderator mới có quyền ghim tin nhắn");
        }

        long pinnedCount = chatMessageRepository.countBySessionAndIsPinnedTrue(session);
        if (pinnedCount >= 3 && !Boolean.TRUE.equals(message.getIsPinned())) {
            throw new BadRequestException("Phòng đã đạt tối đa 3 tin nhắn ghim");
        }

        message.setIsPinned(true);
        chatMessageRepository.save(message);
    }
}