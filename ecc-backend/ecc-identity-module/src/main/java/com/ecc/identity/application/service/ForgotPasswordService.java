package com.ecc.identity.application.service;

import com.ecc.common.exception.BadRequestException;
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

        // 3. Gửi Email (HTML)
        String subject = "[English Chat Club] Yêu cầu đặt lại mật khẩu";
        String htmlBody = "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<style>"
                + "body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; }"
                + ".container { max-w-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; }"
                + ".header { background: linear-gradient(135deg, #6366f1, #ec4899); padding: 30px 20px; text-align: center; color: white; }"
                + ".header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }"
                + ".content { padding: 40px 30px; color: #334155; line-height: 1.6; font-size: 16px; }"
                + ".otp-box { background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }"
                + ".otp-code { font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: 5px; margin: 0; }"
                + ".button-container { text-align: center; margin-top: 30px; }"
                + ".btn { display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.3s; }"
                + ".btn:hover { background-color: #4f46e5; }"
                + ".footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; }"
                + "</style>"
                + "</head>"
                + "<body>"
                + "<div class=\"container\">"
                + "<div class=\"header\">"
                + "<h1>ENGLISH CHAT CLUB</h1>"
                + "</div>"
                + "<div class=\"content\">"
                + "<p>Chào bạn,</p>"
                + "<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này. Vui lòng sử dụng mã OTP dưới đây để tiến hành khôi phục tài khoản của bạn:</p>"
                + "<div class=\"otp-box\">"
                + "<p style=\"margin-top: 0; margin-bottom: 10px; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;\">Mã OTP bảo mật của bạn</p>"
                + "<p class=\"otp-code\">" + otp + "</p>"
                + "</div>"
                + "<p>Hoặc nếu bạn muốn đặt lại mật khẩu thông qua liên kết trực tiếp, vui lòng nhấn vào nút bên dưới:</p>"
                + "<div class=\"button-container\">"
                + "<a href=\"http://localhost:3000/reset-password?token=" + rawToken + "\" class=\"btn\">Đặt Lại Mật Khẩu</a>"
                + "</div>"
                + "<p style=\"margin-top: 30px; font-size: 14px; color: #ef4444;\"><b>Lưu ý:</b> Mã OTP và liên kết này sẽ hết hạn trong vòng 15 phút.</p>"
                + "</div>"
                + "<div class=\"footer\">"
                + "<p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và đảm bảo mật khẩu của bạn đủ mạnh.</p>"
                + "<p>&copy; 2026 English Chat Club. All rights reserved.</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";

        emailService.sendHtmlEmail(email, subject, htmlBody);
    }

    @Override
    @Transactional
    public void resetPasswordWithOtp(String email, String otp, String newPassword) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email không tồn tại."));

        String cachedOtp = tokenCachePort.getResetPasswordOtp(user.getId());
        if (cachedOtp == null || !cachedOtp.equals(otp)) {
            throw new BadRequestException("Mã OTP không chính xác hoặc đã hết hạn.");
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