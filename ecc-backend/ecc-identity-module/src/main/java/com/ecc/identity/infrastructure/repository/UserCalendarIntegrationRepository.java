package com.ecc.identity.infrastructure.repository;

import com.ecc.identity.domain.model.UserCalendarIntegration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCalendarIntegrationRepository extends JpaRepository<UserCalendarIntegration, Long> {
    Optional<UserCalendarIntegration> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}