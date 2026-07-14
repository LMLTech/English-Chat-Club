package com.ecc.content.infrastructure.adapter;

import com.ecc.content.application.port.out.EmailMarketingPort;
import com.ecc.content.domain.model.CampaignSentLog;
import com.ecc.content.domain.model.EmailCampaign;
import com.ecc.content.infrastructure.repository.CampaignSentLogRepository;
import com.ecc.content.infrastructure.repository.EmailCampaignRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailMarketingAdapter implements EmailMarketingPort {

    private final EmailCampaignRepository campaignRepo;
    private final CampaignSentLogRepository logRepo;
    private final JavaMailSender javaMailSender;
    private final JdbcTemplate jdbcTemplate; // Dùng JdbcTemplate để không dính dáng đến Entity của module khác

    @Override
    public EmailCampaign saveCampaign(EmailCampaign campaign) {
        return campaignRepo.save(campaign);
    }

    @Override
    public Optional<EmailCampaign> findCampaignById(Long id) {
        return campaignRepo.findById(id);
    }

    @Override
    public void saveLog(CampaignSentLog logRecord) {
        logRepo.save(logRecord);
    }

    @Override
    public void sendHtmlEmail(String toAddress, String subject, String htmlContent) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toAddress);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            javaMailSender.send(message);
        } catch (Exception e) {
            log.error("[Mail Adapter] Lỗi khi gửi mail tới {}: {}", toAddress, e.getMessage());
        }
    }

    @Override
    public List<String> getActiveUserEmails(String targetAudience) {
        String sql = "SELECT email FROM users WHERE status = 'ACTIVE'";
        
        if ("MEMBER".equals(targetAudience) || "MODERATOR".equals(targetAudience)) {
            sql += " AND role = '" + targetAudience + "'";
        }
        
        return jdbcTemplate.queryForList(sql, String.class);
    }

    @Override
    public List<EmailCampaign> getAllCampaigns() {
        return campaignRepo.findAll();
    }
}