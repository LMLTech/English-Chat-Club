package com.ecc.identity.application.port.out;

import com.ecc.identity.domain.model.User;
import java.util.Optional;

public interface UserRepositoryPort {
    boolean existsByEmail(String email);
    Optional<User> findByReferralCode(String referralCode);
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    java.util.List<User> findByEmailContainingIgnoreCase(String email);
    java.util.List<User> findAll();
    User save(User user);
}