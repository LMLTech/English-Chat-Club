package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.UserRepositoryPort;
import com.ecc.identity.domain.model.User;
import com.ecc.identity.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final UserRepository repository;

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }

    @Override
    public Optional<User> findByReferralCode(String referralCode) {
        return repository.findByReferralCode(referralCode);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmail(email);
    }

    @Override
    public User save(User user) {
        return repository.save(user);
    }

    @Override
    public Optional<User> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public java.util.List<User> findAll() {
        return repository.findAll();
    }
}