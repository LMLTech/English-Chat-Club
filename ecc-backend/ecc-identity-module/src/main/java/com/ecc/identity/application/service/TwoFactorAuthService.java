package com.ecc.identity.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.common.exception.UnauthorizedException;
import com.ecc.identity.api.dto.request.Disable2faRequest;
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
import com.ecc.identity.infrastructure.security.AesEncryptionUtil;
import com.ecc.identity.infrastructure.security.JwtTokenProvider;
import com.ecc.identity.infrastructure.security.TotpManager;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final AesEncryptionUtil aesEncryptionUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.jwt.refresh-token-expiration:10080}")
    private long refreshTokenExpirationMinutes;

    @Override
    public Setup2faResponse initiateSetup(Long userId) {
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (Boolean.TRUE.equals(user.getIs2faEnabled())) {
            throw new BadRequestException("Tài khoản này đã bật bảo mật 2 lớp rồi.");
        }

        String secretKey = totpManager.generateSecretKey();
        String qrCodeUrl = totpManager.getQrCodeUrl(secretKey, user.getEmail());
        String qrCodeBase64 = totpManager.getQrCodeImageBase64(qrCodeUrl);

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

        boolean isValid = totpManager.verifyCode(request.getSecretKey(), request.getTotpCode());
        if (!isValid) {
            throw new BadRequestException("Mã xác thực không chính xác. Vui lòng thử lại.");
        }

        // MÃ HÓA AES TRƯỚC KHI LƯU VÀO DATABASE
        String encryptedSecret = aesEncryptionUtil.encrypt(request.getSecretKey());
        user.setTwoFactorSecret(encryptedSecret);
        user.setIs2faEnabled(true);
        userRepositoryPort.save(user);
    }

    @Override
    @Transactional
    public AuthResponse verifyLogin(Verify2faLoginRequest request) {
        Long userId = tokenCachePort.getUserIdByTemp2faToken(request.getTempToken());
        if (userId == null) {
            throw new UnauthorizedException("Phiên xác thực đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
        }

        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // GIẢI MÁ AES TRƯỚC KHI XÁC THỰC OTP
        String decryptedSecret = aesEncryptionUtil.decrypt(user.getTwoFactorSecret());
        boolean isValid = totpManager.verifyCode(decryptedSecret, request.getTotpCode());

        if (!isValid) {
            throw new UnauthorizedException("Mã OTP bảo mật 2 lớp không chính xác.");
        }

        List<String> permissions = List.of("room:join", "profile:read");
        String accessToken = jwtTokenProvider.generateAccessToken(user, permissions);
        String rawRefreshToken = jwtTokenProvider.generateRefreshToken(user);
        String tokenId = jwtTokenProvider.getJtiFromToken(rawRefreshToken);

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

    // HÀM TẮT 2FA
    @Override
    @Transactional
    public void disable2fa(Long userId, Disable2faRequest request) {
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (Boolean.FALSE.equals(user.getIs2faEnabled())) {
            throw new BadRequestException("Bảo mật 2 lớp hiện đang tắt.");
        }

        // Xác minh mật khẩu trước khi cho phép tắt
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu không chính xác.");
        }

        user.setIs2faEnabled(false);
        user.setTwoFactorSecret(null); // Xóa trắng Secret trong DB
        userRepositoryPort.save(user);
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