package com.ecc.community.api.dto.response.friend;

import com.ecc.community.domain.model.friend.DirectMessage;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DirectMessageResponse {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String content;
    private String attachmentUrl;
    private String reaction;
    private String messageType;
    private LocalDateTime deliveredAt;
    private LocalDateTime readAt;
    private boolean isDeleted;
    private LocalDateTime createdAt;

    public static DirectMessageResponse fromEntity(DirectMessage message) {
        return DirectMessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                // If soft deleted, hide content to clients
                .content(message.isDeleted() ? "Tin nhắn đã bị thu hồi" : message.getContent())
                .attachmentUrl(message.isDeleted() ? null : message.getAttachmentUrl())
                .reaction(message.getReaction())
                .messageType(message.getMessageType().name())
                .deliveredAt(message.getDeliveredAt())
                .readAt(message.getReadAt())
                .isDeleted(message.isDeleted())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
