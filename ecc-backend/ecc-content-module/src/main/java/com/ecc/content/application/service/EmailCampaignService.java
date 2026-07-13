package com.ecc.content.application.service;

import com.ecc.content.api.dto.request.EmailCampaignRequest;
import com.ecc.content.application.port.in.EmailCampaignUseCase;
import com.ecc.content.application.port.out.EmailMarketingPort;
import com.ecc.content.domain.model.CampaignSentLog;
import com.ecc.content.domain.model.EmailCampaign;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailCampaignService implements EmailCampaignUseCase {

    private final EmailMarketingPort marketingPort;

    @Override
    @Transactional
    public EmailCampaign createCampaign(Long adminId, EmailCampaignRequest request) {
        EmailCampaign campaign = EmailCampaign.builder()
                .title(request.getTitle())
                .subject(request.getSubject())
                .htmlContent(request.getHtmlContent())
                .targetSegment(request.getTargetSegment())
                .scheduledAt(request.getScheduledAt())
                .status("DRAFT")
                .createdBy(adminId)
                .build();

        log.info("[Marketing] Tạo chiến dịch email mới: {}", request.getTitle());
        return marketingPort.saveCampaign(campaign);
    }

    /**
     * @Async giúp việc gửi hàng loạt email chạy ngầm, không block API của Admin
     */
    @Async
    @Override
    @Transactional
    public void sendCampaignNow(Long campaignId) {
        EmailCampaign campaign = marketingPort.findCampaignById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign không tồn tại"));

        campaign.setStatus("SENDING");
        marketingPort.saveCampaign(campaign);

        // 1. Lấy danh sách email
        List<String> targetEmails = marketingPort.getActiveUserEmails();
        log.info("[Marketing] Bắt đầu gửi campaign '{}' cho {} users", campaign.getTitle(), targetEmails.size());

        // Tạo nội dung HTML chuyên nghiệp
        String professionalHtml = buildProfessionalHtmlTemplate(campaign.getTitle(), campaign.getHtmlContent());

        int successCount = 0;

        // 2. Gửi mail và lưu log
        for (String email : targetEmails) {
            try {
                marketingPort.sendHtmlEmail(email, campaign.getSubject(), professionalHtml);

                CampaignSentLog sentLog = CampaignSentLog.builder()
                        .campaign(campaign)
                        .emailAddress(email)
                        .build();
                marketingPort.saveLog(sentLog);
                successCount++;

                // Nghỉ 0.5s giữa các lần gửi để tránh bị đánh dấu Spam
                Thread.sleep(500);
            } catch (Exception e) {
                log.error("[Marketing] Fail gửi tới {}: {}", email, e.getMessage());
            }
        }

        // 3. Kết thúc
        campaign.setStatus("SENT");
        campaign.setSentAt(LocalDateTime.now());
        marketingPort.saveCampaign(campaign);
        log.info("[Marketing] Hoàn tất campaign '{}'. Thành công: {}/{}", campaign.getTitle(), successCount, targetEmails.size());
    }

    /**
     * Hàm bọc nội dung email vào một Template HTML chuyên nghiệp của hệ thống
     */
    private String buildProfessionalHtmlTemplate(String title, String rawContent) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "  body { font-family: Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }" +
                "  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }" +
                "  .header { background-color: #4CAF50; color: #ffffff; text-align: center; padding: 20px; font-size: 24px; font-weight: bold; }" +
                "  .content { padding: 30px; color: #333333; line-height: 1.6; font-size: 16px; }" +
                "  .content h2 { color: #4CAF50; margin-top: 0; }" +
                "  .footer { background-color: #f1f1f1; color: #777777; text-align: center; padding: 15px; font-size: 12px; }" +
                "  .btn { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>English Chat Club (ECC)</div>" +
                "    <div class='content'>" +
                "      <h2>" + title + "</h2>" +
                "      " + rawContent +
                "      <br/>" +
                "      <p>Cảm ơn bạn đã luôn đồng hành cùng ECC!</p>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      © 2026 English Chat Club. Nền tảng thực hành hội thoại Tiếng Anh.<br/>" +
                "      Bạn nhận được email này vì đã đăng ký tài khoản tại hệ thống của chúng tôi." +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmailCampaign> getAllCampaigns() {
        return marketingPort.getAllCampaigns(); // Wait, let's see if marketingPort has getAllCampaigns
    }
}