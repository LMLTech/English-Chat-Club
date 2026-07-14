package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.EmailPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
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
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(senderEmail);
            helper.setBcc(toEmails.toArray(new String[0]));
            helper.setSubject("English Chat Club - Tổng kết phòng: " + sessionTitle);
            
            String htmlMsg = "<div style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; overflow: hidden;\">"
                    + "<div style=\"background-color: #7c3aed; padding: 20px; text-align: center; color: white;\">"
                    + "<h1 style=\"margin: 0; font-size: 24px;\">English Chat Club</h1>"
                    + "<p style=\"margin: 5px 0 0; font-size: 16px; opacity: 0.9;\">Tổng kết buổi học: " + sessionTitle + "</p>"
                    + "</div>"
                    + "<div style=\"padding: 30px;\">"
                    + "<p style=\"font-size: 16px;\">Chào bạn,</p>"
                    + "<p style=\"font-size: 15px; color: #555;\">Cảm ơn bạn đã tham gia buổi học. Dưới đây là nội dung tổng kết từ Moderator:</p>"
                    + "<div style=\"background-color: #f8fafc; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;\">"
                    + "<p style=\"margin: 0; white-space: pre-wrap; font-style: italic;\">" + summaryContent + "</p>"
                    + "</div>"
                    + "<p style=\"font-size: 15px; color: #555;\">Hy vọng bạn đã có những phút giây học tập thú vị. Hẹn gặp lại bạn trong các buổi học tiếp theo!</p>"
                    + "</div>"
                    + "<div style=\"background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;\">"
                    + "<p style=\"margin: 0;\">&copy; 2026 English Chat Club. All rights reserved.</p>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlMsg, true);

            mailSender.send(message);
            log.info("Đã thực hiện gửi email tổng kết (HTML) đến {} học viên thành công!", toEmails.size());

        } catch (Exception e) {
            log.error("Gửi email HTML thất bại: {}", e.getMessage());
        }
    }
}