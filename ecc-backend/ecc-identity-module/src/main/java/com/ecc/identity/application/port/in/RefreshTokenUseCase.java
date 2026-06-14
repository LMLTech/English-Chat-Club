package com.ecc.identity.application.port.in;

import com.ecc.identity.api.dto.request.RefreshTokenRequest;
import com.ecc.identity.api.dto.response.AuthResponse;

public interface RefreshTokenUseCase {
    AuthResponse refreshToken(RefreshTokenRequest request);
}
