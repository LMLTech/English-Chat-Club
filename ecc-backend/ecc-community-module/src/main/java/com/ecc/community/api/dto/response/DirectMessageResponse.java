package com.ecc.community.api.dto.response;

import com.ecc.community.domain.model.DirectMessage;
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
    private String messageType;
    private LocalDateTime readAt;
    private boolean isDeleted;
    private LocalDateTime createdAt;

    public static DirectMessageResponse fromEntity(DirectMessage message) {
        return DirectMessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                // Kiểm tra Soft Delete qua deletedAt
                .content(message.getDeletedAt() != null ? "Tin nhắn đã bị thu hồi" : message.getContent())
                .messageType(message.getMessageType().name())
                .readAt(message.getReadAt())
                .isDeleted(message.getDeletedAt() != null)
                .createdAt(message.getCreatedAt())
                .build();
    }
}