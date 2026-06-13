package com.ecc.identity.infrastructure.repository;

import com.ecc.identity.domain.model.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Spring quản lý Repository Bean
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    // Tìm token xác minh email theo tokenHash
    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

}