package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.TokenRepositoryPort;
import com.ecc.identity.domain.model.RefreshToken;
import com.ecc.identity.domain.model.EmailVerificationToken;
import com.ecc.identity.infrastructure.repository.EmailVerificationTokenRepository;
import com.ecc.identity.infrastructure.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component // Adapter triển khai TokenRepositoryPort
@RequiredArgsConstructor // Tự động tạo constructor cho dependency
public class TokenRepositoryAdapter implements TokenRepositoryPort {

    private final EmailVerificationTokenRepository repository;
    private final RefreshTokenRepository refreshTokenRepository;


    @Override
    public EmailVerificationToken saveEmailToken(EmailVerificationToken token) {
        // Lưu EmailVerificationToken vào database
        return repository.save(token);
    }

    @Override
    public Optional<EmailVerificationToken> findByTokenHash(String tokenHash) {
        // Tìm token xác minh email theo tokenHash
        return repository.findByTokenHash(tokenHash);
    }

    @Override
    public RefreshToken saveRefreshToken(RefreshToken refreshToken) {
        return refreshTokenRepository.save(refreshToken);
    }
}