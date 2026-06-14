package com.ecc.identity.application.port.in;

public interface ForgotPasswordUseCase {
    void requestPasswordReset(String email);
    void resetPasswordWithOtp(String email, String otp, String newPassword);
    void verifyResetToken(String token);
    void resetPasswordWithToken(String token, String newPassword);
}