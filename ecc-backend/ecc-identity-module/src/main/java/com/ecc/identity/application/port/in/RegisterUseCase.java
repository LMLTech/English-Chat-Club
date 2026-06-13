package com.ecc.identity.application.port.in;

import com.ecc.identity.api.dto.request.RegisterRequest;

public interface RegisterUseCase {
    void register(RegisterRequest request);
}