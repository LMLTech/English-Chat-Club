package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.EmailSenderPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailSenderAdapter implements EmailSenderPort {

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(String email, String rawToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("English Chat Club (ECC) - Xác minh tài khoản của bạn");

            // Link gọi về API verify
            String verificationLink = "http://localhost:8080/api/auth/verify-email?token=" + rawToken;

            message.setText("Chào bạn,\n\n" +
                    "Cảm ơn bạn đã đăng ký tham gia English Chat Club. Vui lòng click vào đường link bên dưới để xác minh tài khoản của bạn:\n\n" +
                    verificationLink + "\n\n" +
                    "Đường link này sẽ hết hạn sau 24 giờ.\n\n" +
                    "Trân trọng,\nĐội ngũ ECC.");

            mailSender.send(message);
            log.info("📧 REAL EMAIL SENDER: Đã gửi email xác minh thành công tới [{}]", email);
        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi email tới [{}]: {}", email, e.getMessage());
            // Trong thực tế có thể quăng ra Custom Exception nếu muốn request thất bại khi không gửi được mail
        }
    }
}