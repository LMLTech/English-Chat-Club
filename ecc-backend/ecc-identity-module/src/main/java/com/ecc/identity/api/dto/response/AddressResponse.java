package com.ecc.identity.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private Long id;
    private String recipientName;
    private String phone;
    private String province;
    private String district;
    private String detail;
    private Boolean isDefault;
}