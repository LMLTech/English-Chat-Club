package com.ecc.content.infrastructure.repository;

import com.ecc.content.domain.model.CampaignSentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CampaignSentLogRepository extends JpaRepository<CampaignSentLog, Long> {}