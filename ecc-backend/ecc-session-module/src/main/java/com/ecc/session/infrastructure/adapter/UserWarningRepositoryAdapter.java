package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.UserWarningRepositoryPort;
import com.ecc.session.domain.model.UserWarning;
import com.ecc.session.infrastructure.repository.UserWarningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserWarningRepositoryAdapter implements UserWarningRepositoryPort {

    private final UserWarningRepository repository;

    @Override
    public UserWarning save(UserWarning entity) {
        return repository.save(entity);
    }

    @Override
    public Optional<UserWarning> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<UserWarning> findAll() {
        return repository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
    
    @Override
    public void delete(UserWarning entity) {
        repository.delete(entity);
    }

    @Override
    public long countByUserIdAndCreatedAtAfter(Long userId, java.time.LocalDateTime date) {
        return repository.countByUserIdAndCreatedAtAfter(userId, date);
    }
}
