package com.ecc.session.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

    private String uuid;

    private Long sessionId;

    private Long senderId;

    private String content;

    private String type;

    private LocalDateTime createdAt;

    private LocalDateTime deletedAt;

    private Boolean isPinned;
}