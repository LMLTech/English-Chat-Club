package com.ecc.identity.application.port.out;

public interface EmailSenderPort {
    void sendVerificationEmail(String email, String tokenHash);
}