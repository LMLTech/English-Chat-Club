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

    // Đã mở comment: Cần có Port này để thao tác với bảng password_reset_tokens
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

        // ĐÃ SỬA: Lưu rawToken (đã hash) vào bảng password_reset_tokens qua Port
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(hashString(rawToken))
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
        resetTokenPort.save(resetToken);

        // 3. Gửi Email thật
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
        // ĐÃ SỬA: Tìm tokenHash trong DB, kiểm tra expiresAt. Ném lỗi nếu sai hoặc hết hạn.
        String tokenHash = hashString(token);
        PasswordResetToken resetToken = resetTokenPort.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Đường dẫn đặt lại mật khẩu không hợp lệ hoặc đã từng được sử dụng."));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Đường dẫn đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.");
        }
    }

    @Override
    @Transactional
    public void resetPasswordWithToken(String token, String newPassword) {
        // ĐÃ SỬA: Lấy User từ DB thông qua tokenHash, cập nhật mật khẩu và xóa token
        String tokenHash = hashString(token);
        PasswordResetToken resetToken = resetTokenPort.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Token đặt lại mật khẩu không hợp lệ."));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token đặt lại mật khẩu đã hết hạn.");
        }

        User user = resetToken.getUser();
        updatePasswordAndCleanUp(user, newPassword);

        // Xóa token này khỏi DB để không thể dùng lại được nữa
        resetTokenPort.delete(resetToken);
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