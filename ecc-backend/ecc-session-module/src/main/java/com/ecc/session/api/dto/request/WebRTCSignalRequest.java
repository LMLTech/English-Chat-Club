package com.ecc.session.api.dto.request;

import lombok.Data;

@Data
public class WebRTCSignalRequest {
    private String type;
    private String senderId;
    private String targetId;
    private Object payload;
}
