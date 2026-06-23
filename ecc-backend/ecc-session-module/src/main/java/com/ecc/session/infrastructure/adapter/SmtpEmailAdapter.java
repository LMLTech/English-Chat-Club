package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.EmailPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SmtpEmailAdapter implements EmailPort {

    private final JavaMailSender mailSender;

    // Lấy đúng email sender từ cấu hình
    @Value("${spring.mail.username}")
    private String senderEmail;

    @Override
    public void sendSessionSummary(List<String> toEmails, String sessionTitle, String summaryContent) {
        if (toEmails == null || toEmails.isEmpty()) {
            log.warn("Không tìm thấy học viên nào có booking CONFIRMED để gửi email tổng kết.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            // Sử dụng BCC để gửi đồng loạt mà không bị lộ danh sách email của nhau
            message.setBcc(toEmails.toArray(new String[0]));
            message.setSubject("English Chat Club - Tổng kết phòng: " + sessionTitle);
            message.setText("Chào bạn,\n\nDưới đây là nội dung tổng kết buổi học bạn vừa tham gia:\n\n"
                    + summaryContent
                    + "\n\nCảm ơn bạn đã đồng hành cùng ECC!");

            mailSender.send(message);
            log.info("Đã thực hiện gửi email tổng kết thật đến {} học viên thành công!", toEmails.size());

        } catch (Exception e) {
            log.error("Gửi email thất bại: {}", e.getMessage());
        }
    }
}