package com.ecc.identity.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity // Entity lưu lịch sử đăng nhập thất bại
@Table(name = "failed_login_attempts", indexes = {
        @Index(name = "idx_fla_email_time", columnList = "email, attempted_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FailedLoginAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Email thực hiện đăng nhập
    @Column(nullable = false)
    private String email;

    // Địa chỉ IP thực hiện đăng nhập
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    // Thời điểm đăng nhập thất bại
    @CreationTimestamp
    @Column(name = "attempted_at", nullable = false, updatable = false)
    private LocalDateTime attemptedAt;
}