package com.ecc.content.application.port.out;

import com.ecc.content.domain.model.EmailCampaign;
import com.ecc.content.domain.model.CampaignSentLog;

import java.util.List;
import java.util.Optional;

public interface EmailMarketingPort {
    EmailCampaign saveCampaign(EmailCampaign campaign);
    Optional<EmailCampaign> findCampaignById(Long id);
    void saveLog(CampaignSentLog log);

    // Gửi email thực tế qua SMTP
    void sendHtmlEmail(String toAddress, String subject, String htmlContent);

    // Lấy danh sách email của User (Không query Entity User để giữ đúng kiến trúc)
    List<String> getActiveUserEmails(String targetAudience);
    
    List<EmailCampaign> getAllCampaigns();
}