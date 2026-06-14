package com.ecc.identity.application.service;

import com.ecc.common.exception.AccountLockedException;
import com.ecc.common.exception.UnauthorizedException;
import com.ecc.identity.api.dto.response.AuthResponse;
import com.ecc.identity.api.dto.request.LoginRequest;
import com.ecc.identity.application.port.in.LoginUseCase;
import com.ecc.identity.application.port.out.LoginAttemptRepositoryPort;
import com.ecc.identity.application.port.out.TokenCachePort;
import com.ecc.identity.application.port.out.TokenRepositoryPort;
import com.ecc.identity.application.port.out.UserRepositoryPort;
import com.ecc.identity.domain.model.RefreshToken;
import com.ecc.identity.domain.model.User;
import com.ecc.identity.infrastructure.security.JwtTokenProvider;
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
public class LoginService implements LoginUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final LoginAttemptRepositoryPort loginAttemptPort;
    private final TokenRepositoryPort tokenRepositoryPort;
    private final TokenCachePort tokenCachePort;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // Đọc thời gian sống của Refresh Token từ file cấu hình
    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMinutes;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_TIME_DURATION_MINUTES = 15;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress) {
        String email = request.getEmail().toLowerCase();

        // 1. Kiểm tra Brute-force
        LocalDateTime timeLimit = LocalDateTime.now().minusMinutes(LOCK_TIME_DURATION_MINUTES);
        int failedAttempts = loginAttemptPort.countRecentFailedAttempts(email, timeLimit);
        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            throw new AccountLockedException("Tài khoản đang bị khóa tạm thời do nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.");
        }

        // 2. Tìm User
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không chính xác"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.");
        }

        // 3. So sánh mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            loginAttemptPort.recordFailedAttempt(email, ipAddress);
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        }

        // Đăng nhập đúng -> Xóa lịch sử đăng nhập sai
        loginAttemptPort.clearAttempts(email);

        // 4. Kiểm tra 2FA
        if (user.getIs2faEnabled() != null && user.getIs2faEnabled()) {
            String tempToken = jwtTokenProvider.generateTemp2faToken(user);
            tokenCachePort.saveTemp2faToken(tempToken, user.getId(), 5); // Lưu Redis 5 phút
            return AuthResponse.builder()
                    .require2fa(true)
                    .tempToken(tempToken)
                    .build();
        }

        // 5. Sinh Token Kép (Access & Refresh)
        List<String> permissions = List.of("room:join", "profile:read"); // Mock trước khi có RBAC
        String accessToken = jwtTokenProvider.generateAccessToken(user, permissions);

        String rawRefreshToken = jwtTokenProvider.generateRefreshToken(user); // Tạo chuỗi JWT
        String tokenId = jwtTokenProvider.getJtiFromToken(rawRefreshToken); // Trích xuất JTI từ JWT

        // Đã sửa: Lưu MySQL (Sử dụng plusMinutes và lấy số liệu từ application.yml)
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenId(tokenId)
                .tokenHash(hashString(rawRefreshToken))
                .expiresAt(LocalDateTime.now().plusMinutes(refreshTokenExpirationMinutes))
                .revoked(false)
                .build();
        tokenRepositoryPort.saveRefreshToken(refreshTokenEntity);

        // Lưu Redis truyền số phút lấy từ application.yml
        tokenCachePort.saveRefreshToken(user.getId(), tokenId, refreshTokenExpirationMinutes);

        // Cập nhật last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepositoryPort.save(user);

        return AuthResponse.builder()
                .require2fa(false)
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken) // Trả về raw để client cất đi
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
            throw new RuntimeException("Error hashing", e);
        }
    }
}