package com.ecc.identity.infrastructure.repository;

import com.ecc.identity.domain.model.ReferralHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReferralHistoryRepository extends JpaRepository<ReferralHistory, Long> {
}