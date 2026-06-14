package com.ecc.identity.application.port.out;

import com.ecc.identity.domain.model.User;
import java.util.Optional;

public interface UserRepositoryPort {
    boolean existsByEmail(String email);
    Optional<User> findByReferralCode(String referralCode);
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    // Tìm User theo email
    User save(User user);
}