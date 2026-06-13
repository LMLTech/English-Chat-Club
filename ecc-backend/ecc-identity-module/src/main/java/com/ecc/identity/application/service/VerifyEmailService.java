package com.ecc.identity.application.service;

import com.ecc.common.event.UserRegisteredEvent;
import com.ecc.common.exception.BadRequestException;
import com.ecc.identity.application.port.in.VerifyEmailUseCase;
import com.ecc.identity.application.port.out.EventPublisherPort;
import com.ecc.identity.application.port.out.TokenRepositoryPort;
import com.ecc.identity.application.port.out.UserRepositoryPort;
import com.ecc.identity.domain.model.EmailVerificationToken;
import com.ecc.identity.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service // Service xử lý xác minh email
@RequiredArgsConstructor
public class VerifyEmailService implements VerifyEmailUseCase {

    // Các Port sử dụng trong nghiệp vụ
    private final TokenRepositoryPort tokenRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final EventPublisherPort eventPublisherPort;

    @Override
    @Transactional
    public void verifyEmail(String rawToken) {

        // Băm token từ URL
        String hashedToken = hashTokenWithSHA256(rawToken);

        // Tìm token trong database
        EmailVerificationToken token = tokenRepositoryPort.findByTokenHash(hashedToken)
                .orElseThrow(() -> new BadRequestException("Invalid or missing verification token"));

        // Kiểm tra token đã sử dụng chưa
        if (token.getVerifiedAt() != null) {
            throw new BadRequestException("Email has already been verified");
        }

        // Kiểm tra token còn hạn không
        if (token.isExpired()) {
            throw new BadRequestException("Verification token has expired. Please request a new one.");
        }

        // Xác minh token và kích hoạt tài khoản
        token.verify();
        User user = token.getUser();
        user.activate();

        // Lưu thay đổi vào database
        tokenRepositoryPort.saveEmailToken(token);
        userRepositoryPort.save(user);

        // Phát sự kiện đăng ký thành công
        UserRegisteredEvent event =
                new UserRegisteredEvent(user.getId(), user.getEmail());

        eventPublisherPort.publish(event);
    }

    // Băm token bằng SHA-256
    private String hashTokenWithSHA256(String token) {
        try {

            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder(2 * hash.length);

            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);

                if (hex.length() == 1) {
                    hexString.append('0');
                }

                hexString.append(hex);
            }

            return hexString.toString();

        } catch (Exception e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }
}