package com.ecc.identity.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    /**
     * Dùng @Async để việc gửi mail chạy ngầm,
     * không làm người dùng phải chờ đợi API phản hồi quá lâu.
     */
    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail); // Email người gửi
            message.setTo(to);            // Email người nhận
            message.setSubject(subject);  // Tiêu đề
            message.setText(body);        // Nội dung

            javaMailSender.send(message);
            System.out.println("✅ Đã gửi email thành công tới: " + to);

        } catch (Exception e) {
            System.err.println("❌ Lỗi khi gửi email tới " + to + ": " + e.getMessage());
        }
    }

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(senderEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indicates HTML format

            javaMailSender.send(message);
            System.out.println("✅ Đã gửi HTML email thành công tới: " + to);

        } catch (Exception e) {
            System.err.println("❌ Lỗi khi gửi HTML email tới " + to + ": " + e.getMessage());
        }
    }
}
