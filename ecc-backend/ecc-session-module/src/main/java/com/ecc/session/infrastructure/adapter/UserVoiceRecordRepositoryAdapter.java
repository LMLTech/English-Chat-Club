package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.UserVoiceRecordRepositoryPort;
import com.ecc.session.domain.model.UserVoiceRecord;
import com.ecc.session.infrastructure.repository.UserVoiceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserVoiceRecordRepositoryAdapter implements UserVoiceRecordRepositoryPort {

    private final UserVoiceRecordRepository repository;

    @Override
    public UserVoiceRecord save(UserVoiceRecord entity) {
        return repository.save(entity);
    }

    @Override
    public Optional<UserVoiceRecord> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<UserVoiceRecord> findAll() {
        return repository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
    
    @Override
    public void delete(UserVoiceRecord entity) {
        repository.delete(entity);
    }
}
