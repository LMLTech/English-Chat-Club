package com.ecc.identity.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity // Entity lưu Refresh Token phục vụ JWT Authentication
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User sở hữu Refresh Token
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Mã định danh duy nhất của Refresh Token
    @Column(name = "token_id", nullable = false, unique = true, length = 36)
    private String tokenId;

    // Giá trị Refresh Token đã được băm SHA-256
    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    // Thời gian hết hạn token
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // Đánh dấu token đã bị thu hồi hay chưa
    @Column(nullable = false)
    private Boolean revoked;

    // Thời gian tạo token
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}