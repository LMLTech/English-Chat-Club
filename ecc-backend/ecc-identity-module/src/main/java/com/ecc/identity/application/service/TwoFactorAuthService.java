package com.ecc.identity.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.common.exception.UnauthorizedException;
import com.ecc.identity.api.dto.request.Verify2faLoginRequest;
import com.ecc.identity.api.dto.request.Verify2faSetupRequest;
import com.ecc.identity.api.dto.response.AuthResponse;
import com.ecc.identity.api.dto.response.Setup2faResponse;
import com.ecc.identity.application.port.in.TwoFactorAuthUseCase;
import com.ecc.identity.application.port.out.TokenCachePort;
import com.ecc.identity.application.port.out.TokenRepositoryPort;
import com.ecc.identity.application.port.out.UserRepositoryPort;
import com.ecc.identity.domain.model.RefreshToken;
import com.ecc.identity.domain.model.User;
import com.ecc.identity.infrastructure.security.JwtTokenProvider;
import com.ecc.identity.infrastructure.security.TotpManager;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TwoFactorAuthService implements TwoFactorAuthUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final TokenCachePort tokenCachePort;
    private final TokenRepositoryPort tokenRepositoryPort;
    private final TotpManager totpManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMinutes;

    @Override
    public Setup2faResponse initiateSetup(Long userId) {

        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        // Sinh Secret Key
        String secretKey = totpManager.generateSecretKey();

        // Sinh chuỗi otpauth://...
        String qrCodeUrl =
                totpManager.getQrCodeUrl(secretKey, user.getEmail());

        // Sinh ảnh QR Code Base64
        String qrCodeBase64 =
                totpManager.getQrCodeImageBase64(qrCodeUrl);

        return Setup2faResponse.builder()
                .secretKey(secretKey)
                .qrCodeUrl(qrCodeBase64)
                .build();
    }

    @Override
    @Transactional
    public void finalizeSetup(Long userId, Verify2faSetupRequest request) {
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        // Xác thực mã OTP nhập vào có tương thích với SecretKey mới sinh không
        boolean isValid = totpManager.verifyCode(request.getSecretKey(), request.getTotpCode());
        if (!isValid) {
            throw new BadRequestException("Mã xác thực không chính xác. Vui lòng quét lại và kiểm tra.");
        }

        // Lưu Secret Key vĩnh viễn vào DB và bật cờ kích hoạt 2FA
        user.setTwoFactorSecret(request.getSecretKey());
        user.setIs2faEnabled(true);
        userRepositoryPort.save(user);
    }

    @Override
    @Transactional
    public AuthResponse verifyLogin(Verify2faLoginRequest request) {
        // 1. Kiểm tra tính hợp lệ của Temp Token trong Redis Cache
        Long userId = tokenCachePort.getUserIdByTemp2faToken(request.getTempToken());
        if (userId == null) {
            throw new UnauthorizedException("Phiên xác thực đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
        }

        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // 2. Kiểm tra mã OTP gửi lên với Secret Key nằm trong DB
        boolean isValid = totpManager.verifyCode(user.getTwoFactorSecret(), request.getTotpCode());
        if (!isValid) {
            throw new UnauthorizedException("Mã OTP bảo mật 2 lớp không chính xác.");
        }

        // 3. Sinh Token Kép chính thức giống như Flow 1.3
        List<String> permissions = List.of("room:join", "profile:read");
        String accessToken = jwtTokenProvider.generateAccessToken(user, permissions);

        String rawRefreshToken = UUID.randomUUID().toString();
        String tokenId = UUID.randomUUID().toString();

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenId(tokenId)
                .tokenHash(hashString(rawRefreshToken))
                .expiresAt(LocalDateTime.now().plusMinutes(refreshTokenExpirationMinutes))
                .revoked(false)
                .build();
        tokenRepositoryPort.saveRefreshToken(refreshTokenEntity);

        tokenCachePort.saveRefreshToken(user.getId(), tokenId, refreshTokenExpirationMinutes);

        user.setLastLoginAt(LocalDateTime.now());
        userRepositoryPort.save(user);

        return AuthResponse.builder()
                .require2fa(false)
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .build();
    }

    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}