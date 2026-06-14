package com.ecc.identity.application.service;

import com.ecc.identity.application.port.in.LogoutUseCase;
import com.ecc.identity.application.port.out.TokenCachePort;
import com.ecc.identity.application.port.out.TokenRepositoryPort;
import com.ecc.identity.domain.model.RefreshToken;
import com.ecc.identity.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutUseCase {

    private final TokenCachePort tokenCachePort;
    private final TokenRepositoryPort tokenRepositoryPort;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public void logout(String accessToken, String refreshToken) {
        // 1. Đưa Access Token vào Blacklist (Redis)
        if (accessToken != null && !accessToken.isEmpty() && jwtTokenProvider.validateToken(accessToken)) {
            String accessJti = jwtTokenProvider.getJtiFromToken(accessToken);
            long remainingSeconds = jwtTokenProvider.getRemainingTimeInSeconds(accessToken);
            if (remainingSeconds > 0) {
                tokenCachePort.addToBlacklist(accessJti, remainingSeconds);
            }
        }

        // 2. Thu hồi Refresh Token (MySQL & Redis)
        if (refreshToken != null && !refreshToken.isEmpty() && jwtTokenProvider.validateToken(refreshToken)) {
            String refreshJti = jwtTokenProvider.getJtiFromToken(refreshToken);

            // Tìm và vô hiệu hóa trong DB
            tokenRepositoryPort.findByTokenId(refreshJti).ifPresent(token -> {
                token.setRevoked(true);
                tokenRepositoryPort.saveRefreshToken(token);

                // Xóa luôn khỏi Redis
                tokenCachePort.deleteRefreshToken(token.getUser().getId(), refreshJti);
            });
        }
    }
}
