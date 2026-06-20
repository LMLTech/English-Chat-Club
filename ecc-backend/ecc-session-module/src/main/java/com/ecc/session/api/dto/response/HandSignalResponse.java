package com.ecc.session.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HandSignalResponse {
    private Long sessionId;
    private Long userId; // Người bị tác động (người giơ tay / được duyệt)
    private String action;
    private String message;
}