package com.ecc.identity.infrastructure.repository;

import com.ecc.identity.domain.model.FailedLoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository // Repository thao tác với bảng failed_login_attempts
public interface LoginAttemptRepository extends JpaRepository<FailedLoginAttempt, Long> {

    // Đếm số lần đăng nhập thất bại sau một thời điểm
    int countByEmailAndAttemptedAtAfter(String email, LocalDateTime attemptedAt);

    // Xóa toàn bộ lịch sử đăng nhập thất bại của email
    @Modifying
    @Query("DELETE FROM FailedLoginAttempt f WHERE f.email = :email")
    void deleteByEmail(String email);
}