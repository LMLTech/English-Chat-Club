package com.ecc.identity.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.common.exception.UnauthorizedException;
import com.ecc.identity.application.port.in.ForgotPasswordUseCase;
import com.ecc.identity.application.port.out.TokenCachePort;
import com.ecc.identity.application.port.out.UserRepositoryPort;
import com.ecc.identity.application.port.out.PasswordResetTokenRepositoryPort;
import com.ecc.identity.domain.model.PasswordResetToken;
import com.ecc.identity.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService implements ForgotPasswordUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final TokenCachePort tokenCachePort;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepositoryPort resetTokenPort;

    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trong hệ thống."));

        // 1. Tạo OTP (6 số)
        String otp = String.format("%06d", new Random().nextInt(999999));
        tokenCachePort.saveResetPasswordOtp(user.getId(), otp, 15);

        // 2. Tạo Token Link
        String rawToken = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(hashString(rawToken))
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
        resetTokenPort.save(resetToken);

        // 3. Gửi Email
        String subject = "[English Chat Club] Yêu cầu đặt lại mật khẩu";
        String body = "Chào bạn,\n\n" +
                "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n" +
                "Mã OTP bảo mật của bạn là: " + otp + "\n\n" +
                "Hoặc bạn có thể nhấp vào đường link dưới đây để đổi mật khẩu:\n" +
                "http://localhost:8080/api/auth/reset-password?token=" + rawToken + "\n\n" +
                "Mã OTP và Link này sẽ hết hạn trong 15 phút.\n" +
                "Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.";

        emailService.sendEmail(email, subject, body);
    }

    @Override
    @Transactional
    public void resetPasswordWithOtp(String email, String otp, String newPassword) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email không tồn tại."));

        String cachedOtp = tokenCachePort.getResetPasswordOtp(user.getId());
        if (cachedOtp == null || !cachedOtp.equals(otp)) {
            throw new UnauthorizedException("Mã OTP không chính xác hoặc đã hết hạn.");
        }

        updatePasswordAndCleanUp(user, newPassword);
    }

    @Override
    public void verifyResetToken(String token) {
        String tokenHash = hashString(token);
        PasswordResetToken resetToken = resetTokenPort.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Đường dẫn đặt lại mật khẩu không hợp lệ."));

        // KIỂM TRA ĐÃ SỬ DỤNG CHƯA
        if (resetToken.getUsedAt() != null) {
            throw new BadRequestException("Đường dẫn này đã được sử dụng để đổi mật khẩu trước đó.");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Đường dẫn đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.");
        }
    }

    @Override
    @Transactional
    public void resetPasswordWithToken(String token, String newPassword) {
        String tokenHash = hashString(token);
        PasswordResetToken resetToken = resetTokenPort.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Token đặt lại mật khẩu không hợp lệ."));

        // KIỂM TRA ĐÃ SỬ DỤNG CHƯA
        if (resetToken.getUsedAt() != null) {
            throw new BadRequestException("Token này đã được sử dụng.");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token đặt lại mật khẩu đã hết hạn.");
        }

        User user = resetToken.getUser();
        updatePasswordAndCleanUp(user, newPassword);

        // THAY VÌ XÓA (DELETE), TA CẬP NHẬT TRẠNG THÁI (SOFT DELETE / USED)
        resetToken.setUsedAt(LocalDateTime.now());
        resetTokenPort.save(resetToken);
    }

    private void updatePasswordAndCleanUp(User user, String newPassword) {
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepositoryPort.save(user);
        tokenCachePort.deleteResetPasswordOtp(user.getId());
    }

    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}