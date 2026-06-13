package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.LoginAttemptRepositoryPort;
import com.ecc.identity.domain.model.FailedLoginAttempt;
import com.ecc.identity.infrastructure.repository.LoginAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component // Adapter kết nối Application Layer với JPA Repository
@RequiredArgsConstructor
public class LoginAttemptAdapter implements LoginAttemptRepositoryPort {

    // Repository thao tác với bảng failed_login_attempts
    private final LoginAttemptRepository repository;

    @Override
    public int countRecentFailedAttempts(String email, LocalDateTime since) {

        // Đếm số lần đăng nhập thất bại kể từ thời điểm chỉ định
        return repository.countByEmailAndAttemptedAtAfter(email, since);
    }

    @Override
    public void recordFailedAttempt(String email, String ipAddress) {

        // Lưu một lần đăng nhập thất bại
        repository.save(
                FailedLoginAttempt.builder()
                        .email(email)
                        .ipAddress(ipAddress)
                        .build()
        );
    }

    @Override
    @Transactional
    public void clearAttempts(String email) {

        // Xóa toàn bộ lịch sử đăng nhập thất bại của email
        repository.deleteByEmail(email);
    }
}