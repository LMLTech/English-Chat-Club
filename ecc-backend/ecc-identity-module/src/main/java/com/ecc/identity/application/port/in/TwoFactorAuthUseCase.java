package com.ecc.identity.application.port.in;

import com.ecc.identity.api.dto.request.Verify2faLoginRequest;
import com.ecc.identity.api.dto.request.Verify2faSetupRequest;
import com.ecc.identity.api.dto.response.AuthResponse;
import com.ecc.identity.api.dto.response.Setup2faResponse;

public interface TwoFactorAuthUseCase {
    Setup2faResponse initiateSetup(Long userId);
    void finalizeSetup(Long userId, Verify2faSetupRequest request);
    AuthResponse verifyLogin(Verify2faLoginRequest request);
}