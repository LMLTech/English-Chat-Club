package com.ecc.identity.application.port.in;

// Use Case xác minh email người dùng
public interface VerifyEmailUseCase {

    // Xác minh tài khoản bằng token từ email
    void verifyEmail(String rawToken);
}