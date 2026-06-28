package com.ecc.community.application.service;

import com.ecc.common.event.DirectMessageSentEvent;
import com.ecc.community.application.port.out.DirectMessagePort;
import com.ecc.community.application.port.out.FriendshipPort;
import com.ecc.community.domain.model.DirectMessage;
import com.ecc.community.domain.model.MessageType;
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

    private final DirectMessagePort directMessagePort;
    private final FriendshipPort friendshipPort;

    private final SimpMessagingTemplate messagingTemplate;
    private final SimpUserRegistry simpUserRegistry;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public DirectMessage sendDirectMessage(Long senderId, Long receiverId, String content, String attachmentUrl) {
        // Sử dụng friendshipPort
        if (!friendshipPort.existsByUserIdAndFriendId(senderId, receiverId)) {
            throw new SecurityException("Chỉ có thể nhắn tin với bạn bè");
        }

        DirectMessage message = DirectMessage.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .messageType(MessageType.DIRECT)
                .isRead(false)
                .build();

        DirectMessage savedMessage = directMessagePort.save(message);

        // TODO: Xử lý lưu attachmentUrl vào bảng message_attachments sau nếu có file đính kèm

        boolean isReceiverOnline = simpUserRegistry.getUser(receiverId.toString()) != null;
        if (isReceiverOnline) {
            messagingTemplate.convertAndSendToUser(
                    receiverId.toString(),
                    "/queue/direct",
                    savedMessage
            );
        } else {
            String preview = content != null && content.length() > 50 ? content.substring(0, 50) + "..." : content;
            eventPublisher.publishEvent(new DirectMessageSentEvent(savedMessage.getId(), senderId, receiverId, preview));
        }

        return savedMessage;
    }

    @Transactional
    public void recallMessage(Long senderId, Long messageId) {
        DirectMessage message = directMessagePort.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Tin nhắn không tồn tại"));

        if (!message.getSenderId().equals(senderId)) {
            throw new SecurityException("Không có quyền thu hồi tin nhắn này");
        }

        // Ghi nhận thời gian xóa mềm đúng chuẩn DB
        message.setDeletedAt(LocalDateTime.now());

        directMessagePort.save(message);

        boolean isReceiverOnline = simpUserRegistry.getUser(message.getReceiverId().toString()) != null;
        if (isReceiverOnline) {
            messagingTemplate.convertAndSendToUser(
                    message.getReceiverId().toString(),
                    "/queue/direct",
                    message
            );
        }
    }

    @Transactional(readOnly = true)
    public Page<DirectMessage> getChatHistory(Long userId, Long friendId, Pageable pageable) {
        // Sử dụng friendshipPort
        if (!friendshipPort.existsByUserIdAndFriendId(userId, friendId)) {
            throw new SecurityException("Chỉ có thể xem lịch sử với bạn bè");
        }
        return directMessagePort.findConversationHistory(userId, friendId, pageable);
    }
}