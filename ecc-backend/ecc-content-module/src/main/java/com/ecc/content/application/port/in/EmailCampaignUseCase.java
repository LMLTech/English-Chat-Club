package com.ecc.content.application.port.in;

import com.ecc.content.api.dto.request.EmailCampaignRequest;
import com.ecc.content.domain.model.EmailCampaign;

public interface EmailCampaignUseCase {
    EmailCampaign createCampaign(Long adminId, EmailCampaignRequest request);
    void sendCampaignNow(Long campaignId);
    java.util.List<EmailCampaign> getAllCampaigns();
}