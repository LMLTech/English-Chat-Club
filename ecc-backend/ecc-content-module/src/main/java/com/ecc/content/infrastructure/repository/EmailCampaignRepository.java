package com.ecc.content.infrastructure.repository;

import com.ecc.content.domain.model.EmailCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailCampaignRepository extends JpaRepository<EmailCampaign, Long> {}