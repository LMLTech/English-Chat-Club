package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.UserWarning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface UserWarningRepository extends JpaRepository<UserWarning, Long> {
    long countByUserIdAndCreatedAtAfter(Long userId, LocalDateTime timestamp);
}
