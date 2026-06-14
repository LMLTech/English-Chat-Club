package com.ecc.identity.application.service;

import com.ecc.common.exception.UnauthorizedException;
import com.ecc.identity.api.dto.request.RefreshTokenRequest;
import com.ecc.identity.api.dto.response.AuthResponse;
import com.ecc.identity.application.port.in.RefreshTokenUseCase;
import com.ecc.identity.application.port.out.TokenCachePort;
import com.ecc.identity.application.port.out.TokenRepositoryPort;
import com.ecc.identity.application.port.out.UserRepositoryPort;
import com.ecc.identity.domain.model.RefreshToken;
import com.ecc.identity.domain.model.User;
import com.ecc.identity.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RefreshTokenService implements RefreshTokenUseCase {

    private final TokenRepositoryPort tokenRepositoryPort;
    private final TokenCachePort tokenCachePort;
    private final UserRepositoryPort userRepositoryPort;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String rawRefreshToken = request.getRefreshToken();

        // 1. Kiểm tra tính hợp lệ của JWT Refresh Token
        if (!jwtTokenProvider.validateToken(rawRefreshToken)) {
            throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        // Giả sử tokenId (jti) được lưu trong claim của Refresh Token
        String tokenId = jwtTokenProvider.getJtiFromToken(rawRefreshToken);

        // 2. Tìm trong Database
        RefreshToken refreshToken = tokenRepositoryPort.findByTokenId(tokenId)
                .orElseThrow(() -> new UnauthorizedException("Refresh token không tồn tại"));

        // 3. Kiểm tra trạng thái Revoked và thời hạn
        if (refreshToken.getRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token đã bị thu hồi hoặc hết hạn");
        }

        User user = refreshToken.getUser();

        // 4. Thu hồi Token cũ: Đánh dấu revoked trong MySQL & Xóa key trong Redis
        refreshToken.setRevoked(true);
        tokenRepositoryPort.saveRefreshToken(refreshToken);
        tokenCachePort.deleteRefreshToken(user.getId(), tokenId);

        // 5. Đưa Access Token cũ vào blacklist (Nếu client gửi lên Access Token cần thu hồi ngay)
        String oldAccessToken = request.getAccessToken();
        if (oldAccessToken != null && !oldAccessToken.isEmpty() && jwtTokenProvider.validateToken(oldAccessToken)) {
            String accessJti = jwtTokenProvider.getJtiFromToken(oldAccessToken);
            long remainingSeconds = jwtTokenProvider.getRemainingTimeInSeconds(oldAccessToken);
            if (remainingSeconds > 0) {
                tokenCachePort.addToBlacklist(accessJti, remainingSeconds);
            }
        }

        // 6. Tạo cặp Access/Refresh Token mới
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshTokenStr = jwtTokenProvider.generateRefreshToken(user);
        String newTokenId = jwtTokenProvider.getJtiFromToken(newRefreshTokenStr);

        // 7. Lưu Refresh Token mới vào DB và Redis
        RefreshToken newRefreshTokenEntity = new RefreshToken();
        newRefreshTokenEntity.setUser(user);
        newRefreshTokenEntity.setTokenId(newTokenId);
        newRefreshTokenEntity.setTokenHash(jwtTokenProvider.hashToken(newRefreshTokenStr)); // Cần hàm băm nếu hệ thống của bạn yêu cầu
        newRefreshTokenEntity.setExpiresAt(LocalDateTime.now().plusDays(7));
        newRefreshTokenEntity.setRevoked(false);
        newRefreshTokenEntity.setCreatedAt(LocalDateTime.now());

        tokenRepositoryPort.saveRefreshToken(newRefreshTokenEntity);
        // 7 ngày = 10080 phút
        tokenCachePort.saveRefreshToken(user.getId(), newTokenId, 10080);

        // 8. Trả về kết quả
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                // Nếu AuthResponse của bạn có các trường này thì mở comment ra:
                // .userId(user.getId())
                // .email(user.getEmail())
                .build();
    }
}
