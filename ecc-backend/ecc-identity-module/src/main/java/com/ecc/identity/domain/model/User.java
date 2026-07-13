package com.ecc.identity.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false, columnDefinition = "BINARY(16)")
    private UUID uuid;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "cefr_level", length = 5)
    private String cefrLevel;

    @Column(name = "learning_goal")
    private String learningGoal;

    @Column(nullable = false, length = 20)
    private String status;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Builder.Default
    @Column(name = "is_2fa_enabled", nullable = false)
    private Boolean is2faEnabled = false;

    // ĐÃ THÊM MÃ HÓA TỰ ĐỘNG Ở ĐÂY
    @Convert(converter = com.ecc.common.security.AttributeEncryptor.class)
    @Column(name = "two_factor_secret")
    private String twoFactorSecret;

    @Column(name = "referral_code", unique = true, length = 20)
    private String referralCode;

    @Column(name = "avatar_frame", length = 255)
    private String avatarFrame;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_by")
    private User referredBy;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAddress> addresses = new java.util.ArrayList<>();

    public void activate() {
        this.status = "ACTIVE";
    }

    public boolean isActive() {
        return "ACTIVE".equals(this.status);
    }

    public void addRole(Role role) {
        this.roles.add(role);
    }
}