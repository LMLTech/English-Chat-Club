package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.TokenRepositoryPort;
import com.ecc.identity.domain.model.EmailVerificationToken;
import com.ecc.identity.infrastructure.repository.EmailVerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenRepositoryAdapter implements TokenRepositoryPort {

    private final EmailVerificationTokenRepository repository;

    @Override
    public EmailVerificationToken saveEmailToken(EmailVerificationToken token) {
        return repository.save(token);
    }
}