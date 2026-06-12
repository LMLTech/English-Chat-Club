package com.ecc.identity.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.identity.api.dto.RegisterRequest;
import com.ecc.identity.application.port.in.RegisterUseCase;
import com.ecc.identity.application.port.out.EmailSenderPort;
import com.ecc.identity.application.port.out.TokenRepositoryPort;
import com.ecc.identity.application.port.out.UserRepositoryPort;
import com.ecc.identity.domain.model.EmailVerificationToken;
import com.ecc.identity.domain.model.ReferralHistory;
import com.ecc.identity.domain.model.User;
import com.ecc.identity.infrastructure.repository.ReferralHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegisterService implements RegisterUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final TokenRepositoryPort tokenRepositoryPort;
    private final EmailSenderPort emailSenderPort;
    private final ReferralHistoryRepository referralHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        // 1. Kiểm tra email tồn tại
        if (userRepositoryPort.existsByEmail(request.getEmail().toLowerCase())) {
            throw new BadRequestException("Email is already registered");
        }

        // 2. Tạo User Domain
        User newUser = User.builder()
                .uuid(UUID.randomUUID())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .status("PENDING")
                .is2faEnabled(false)
                .referralCode(generateReferralCode())
                .build();

        // 3. Xử lý Referral Code (Nếu có)
        if (request.getReferralCode() != null && !request.getReferralCode().isBlank()) {
            User referrer = userRepositoryPort.findByReferralCode(request.getReferralCode())
                    .orElseThrow(() -> new BadRequestException("Invalid referral code"));
            newUser.setReferredBy(referrer);
        }

        // 4. Lưu User
        User savedUser = userRepositoryPort.save(newUser);

        // 5. Tạo ReferralHistory nếu có người giới thiệu
        if (savedUser.getReferredBy() != null) {
            ReferralHistory history = ReferralHistory.builder()
                    .referrer(savedUser.getReferredBy())
                    .referredUser(savedUser)
                    .status("SIGNED_UP")
                    .pointsAwarded(0)
                    .build();
            referralHistoryRepository.save(history);
        }

        // 6. Tạo Token xác minh (Lưu bản băm vào DB, giữ bản gốc để gửi Email)
        String rawToken = UUID.randomUUID().toString();
        String hashedToken = hashTokenWithSHA256(rawToken);

        EmailVerificationToken emailToken = EmailVerificationToken.builder()
                .user(savedUser)
                .tokenHash(hashedToken) // BẢO MẬT: Lưu bản đã hash
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
        tokenRepositoryPort.saveEmailToken(emailToken);

        // 7. Gửi Email chứa rawToken
        emailSenderPort.sendVerificationEmail(savedUser.getEmail(), rawToken);
    }

    private String generateReferralCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // Hàm băm token bằng SHA-256
    private String hashTokenWithSHA256(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }
}