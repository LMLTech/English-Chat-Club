package com.ecc.identity.application.port.out;

import com.ecc.identity.api.dto.response.GoogleTokenResponse;

public interface GoogleOAuthPort {
    // Đổi Auth Code lấy cặp Access/Refresh Token từ Google
    GoogleTokenResponse exchangeCodeForToken(String authCode);
}