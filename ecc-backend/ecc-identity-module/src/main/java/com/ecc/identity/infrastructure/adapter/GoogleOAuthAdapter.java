package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.api.dto.response.GoogleTokenResponse;
import com.ecc.identity.application.port.out.GoogleOAuthPort;
import org.springframework.stereotype.Component;

@Component
public class GoogleOAuthAdapter implements GoogleOAuthPort {

    @Override
    public GoogleTokenResponse exchangeCodeForToken(String authCode) {
        // TODO: Cấu hình gọi HTTP POST sang https://oauth2.googleapis.com/token ở đây

        // Tạm thời mock dữ liệu trả về để pass lỗi compile và test luồng DB trước
        GoogleTokenResponse mockResponse = new GoogleTokenResponse();
        mockResponse.setAccessToken("mock_access_token_from_google_abc123");
        mockResponse.setRefreshToken("mock_refresh_token_from_google_xyz789");
        mockResponse.setExpiresIn(3600L);
        mockResponse.setTokenType("Bearer");

        return mockResponse;
    }
}