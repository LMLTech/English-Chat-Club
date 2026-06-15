package com.ecc.identity.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank(message = "Tên người nhận không được để trống")
    private String recipientName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    private String province;
    private String district;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    private String detail;

    private Boolean isDefault = false;
}