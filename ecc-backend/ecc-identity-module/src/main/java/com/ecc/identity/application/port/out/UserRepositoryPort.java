package com.ecc.identity.application.port.out;

import com.ecc.identity.domain.model.User;
import java.util.Optional;

public interface UserRepositoryPort {
    boolean existsByEmail(String email);
    Optional<User> findByReferralCode(String referralCode);
    // Tìm User theo email
    Optional<User> findByEmail(String email);
    User save(User user);
}