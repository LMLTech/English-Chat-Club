package com.ecc.community.application.service;

import com.ecc.common.event.DirectMessageSentEvent;
import com.ecc.community.domain.model.friend.DirectMessage;
import com.ecc.community.infrastructure.repository.DirectMessageRepository;
import com.ecc.community.infrastructure.repository.FriendshipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class DirectMessageService {

    private final DirectMessageRepository messageRepository;
    private final FriendshipRepository friendshipRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final SimpUserRegistry simpUserRegistry;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public DirectMessage sendDirectMessage(Long senderId, Long receiverId, String content, String attachmentUrl) {
        if (!friendshipRepository.existsByUserIdAndFriendId(senderId, receiverId)) {
            throw new SecurityException("Chỉ có thể nhắn tin với bạn bè");
        }

        DirectMessage message = DirectMessage.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .attachmentUrl(attachmentUrl)
                .build();

        DirectMessage savedMessage = messageRepository.save(message);

        // Send via WebSocket if online
        boolean isReceiverOnline = simpUserRegistry.getUser(receiverId.toString()) != null;
        if (isReceiverOnline) {
            messagingTemplate.convertAndSendToUser(
                    receiverId.toString(),
                    "/queue/direct",
                    savedMessage
            );
            savedMessage.setDeliveredAt(LocalDateTime.now());
            messageRepository.save(savedMessage);
        } else {
            // Publish event if offline
            String preview = content.length() > 50 ? content.substring(0, 50) + "..." : content;
            eventPublisher.publishEvent(new DirectMessageSentEvent(savedMessage.getId(), senderId, receiverId, preview));
        }

        return savedMessage;
    }

    @Transactional
    public void recallMessage(Long senderId, Long messageId) {
        DirectMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Tin nhắn không tồn tại"));

        if (!message.getSenderId().equals(senderId)) {
            throw new SecurityException("Không có quyền thu hồi tin nhắn này");
        }

        message.setDeleted(true);
        messageRepository.save(message);

        // Notify receiver about recall via WS if online
        boolean isReceiverOnline = simpUserRegistry.getUser(message.getReceiverId().toString()) != null;
        if (isReceiverOnline) {
            messagingTemplate.convertAndSendToUser(
                    message.getReceiverId().toString(),
                    "/queue/direct",
                    message // Client will see isDeleted = true and update UI
            );
        }
    }

    @Transactional(readOnly = true)
    public Page<DirectMessage> getChatHistory(Long userId, Long friendId, Pageable pageable) {
        if (!friendshipRepository.existsByUserIdAndFriendId(userId, friendId)) {
            throw new SecurityException("Chỉ có thể xem lịch sử với bạn bè");
        }
        return messageRepository.findConversationHistory(userId, friendId, pageable);
    }
}
