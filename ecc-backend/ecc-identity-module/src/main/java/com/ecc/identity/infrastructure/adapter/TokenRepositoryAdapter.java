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

    // 1. Đã sửa kiểu trả về thành void cho khớp với Interface
    @Override
    public void saveRefreshToken(RefreshToken refreshToken) {
        refreshTokenRepository.save(refreshToken);
    }

    // 2. Bổ sung hàm tìm kiếm RefreshToken (Bắt buộc phải có để không bị lỗi đỏ class)
    @Override
    public Optional<RefreshToken> findByTokenId(String tokenId) {
        return refreshTokenRepository.findByTokenId(tokenId);
    }
}