package com.ecc.identity.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Setup2faResponse {
    private String secretKey;
    private String qrCodeUrl;
}