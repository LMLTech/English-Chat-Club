package com.ecc.identity.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.identity.api.dto.response.GoogleTokenResponse;
import com.ecc.identity.application.port.in.GoogleCalendarUseCase;
import com.ecc.identity.application.port.out.CalendarIntegrationRepositoryPort;
import com.ecc.identity.application.port.out.GoogleOAuthPort;
import com.ecc.identity.application.port.out.UserRepositoryPort;
import com.ecc.identity.domain.model.User;
import com.ecc.identity.domain.model.UserCalendarIntegration;
import com.ecc.identity.infrastructure.security.AesEncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GoogleCalendarService implements GoogleCalendarUseCase {

    private final GoogleOAuthPort googleOAuthPort;
    private final CalendarIntegrationRepositoryPort calendarRepoPort;
    private final UserRepositoryPort userRepositoryPort;
    private final AesEncryptionUtil aesEncryptionUtil; // Inject đúng class ở tầng Infrastructure

    @Override
    @Transactional
    public void connectGoogleCalendar(Long userId, String authCode) {
        // 1. Kiểm tra User tồn tại
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new BadRequestException("User không tồn tại"));

        // 2. Đổi Code lấy Token từ Google API
        GoogleTokenResponse tokenResponse = googleOAuthPort.exchangeCodeForToken(authCode);

        // 3. Mã hóa Token bằng AES-256
        String encryptedAccessToken = aesEncryptionUtil.encrypt(tokenResponse.getAccessToken());
        String encryptedRefreshToken = tokenResponse.getRefreshToken() != null
                ? aesEncryptionUtil.encrypt(tokenResponse.getRefreshToken())
                : null;

        // 4. Lưu hoặc Cập nhật vào Database
        UserCalendarIntegration integration = calendarRepoPort.findByUserId(userId)
                .orElse(new UserCalendarIntegration());

        integration.setUser(user);
        integration.setGoogleTokenEncrypted(encryptedAccessToken);
        if (encryptedRefreshToken != null) {
            integration.setGoogleRefreshTokenEncrypted(encryptedRefreshToken);
        }
        // Tính toán thời gian hết hạn (thường Google trả về expires_in = 3600 giây)
        integration.setTokenExpiresAt(LocalDateTime.now().plusSeconds(tokenResponse.getExpiresIn()));
        integration.setSyncEnabled(true);

        calendarRepoPort.save(integration);
    }

    @Override
    @Transactional
    public void disconnectGoogleCalendar(Long userId) {
        calendarRepoPort.deleteByUserId(userId);
    }
}