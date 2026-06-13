package com.ecc.identity.infrastructure.repository;

import com.ecc.identity.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByReferralCode(String referralCode);

    // tìm User theo email
    Optional<User> findByEmail(String email);
}