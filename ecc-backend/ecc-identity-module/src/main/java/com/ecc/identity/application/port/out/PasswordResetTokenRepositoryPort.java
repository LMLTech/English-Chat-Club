package com.ecc.identity.application.port.out;
import com.ecc.identity.domain.model.PasswordResetToken;
import java.util.Optional;

public interface PasswordResetTokenRepositoryPort {
    void save(PasswordResetToken token);
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
    void delete(PasswordResetToken token);
}