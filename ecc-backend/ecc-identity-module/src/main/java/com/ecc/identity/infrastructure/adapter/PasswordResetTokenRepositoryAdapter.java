package com.ecc.identity.infrastructure.adapter;
import com.ecc.identity.application.port.out.PasswordResetTokenRepositoryPort;
import com.ecc.identity.domain.model.PasswordResetToken;
import com.ecc.identity.infrastructure.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PasswordResetTokenRepositoryAdapter implements PasswordResetTokenRepositoryPort {
    private final PasswordResetTokenRepository repository;

    @Override
    public void save(PasswordResetToken token) { repository.save(token); }

    @Override
    public Optional<PasswordResetToken> findByTokenHash(String tokenHash) {
        return repository.findByTokenHash(tokenHash);
    }

    @Override
    public void delete(PasswordResetToken token) { repository.delete(token); }
}
