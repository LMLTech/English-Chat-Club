package com.ecc.identity.api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConnectCalendarRequest {
    private Long userId;
    private String authCode;
}