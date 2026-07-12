package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.UserVoiceRecord;
import java.util.Optional;
import java.util.List;

public interface UserVoiceRecordRepositoryPort {
    UserVoiceRecord save(UserVoiceRecord entity);
    Optional<UserVoiceRecord> findById(Long id);
    List<UserVoiceRecord> findAll();
    void deleteById(Long id);
    void delete(UserVoiceRecord entity);
}
