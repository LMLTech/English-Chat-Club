package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.SessionSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionSummaryRepository extends JpaRepository<SessionSummary, Long> {
}
