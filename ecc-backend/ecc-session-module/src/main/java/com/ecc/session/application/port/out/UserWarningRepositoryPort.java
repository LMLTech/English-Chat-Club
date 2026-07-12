package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.UserWarning;
import java.util.Optional;
import java.util.List;

public interface UserWarningRepositoryPort {
    UserWarning save(UserWarning entity);
    Optional<UserWarning> findById(Long id);
    List<UserWarning> findAll();
    void deleteById(Long id);
    void delete(UserWarning entity);
    long countByUserIdAndCreatedAtAfter(Long userId, java.time.LocalDateTime date);
}
