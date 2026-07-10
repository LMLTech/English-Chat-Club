package com.ecc.identity.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_calendar_integrations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCalendarIntegration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    // Thêm MÃ HÓA TỰ ĐỘNG Ở ĐÂY
    @Convert(converter = com.ecc.common.security.AttributeEncryptor.class)
    @Column(name = "google_token_encrypted", columnDefinition = "TEXT")
    private String googleTokenEncrypted;

    // THÊM MÃ HÓA TỰ ĐỘNG Ở ĐÂY
    @Convert(converter = com.ecc.common.security.AttributeEncryptor.class)
    @Column(name = "google_refresh_token_encrypted", columnDefinition = "TEXT")
    private String googleRefreshTokenEncrypted;

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;

    @Column(name = "sync_enabled", nullable = false)
    private Boolean syncEnabled;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.syncEnabled == null) {
            this.syncEnabled = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}