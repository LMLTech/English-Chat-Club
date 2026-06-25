package com.ecc.community.domain.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Định nghĩa huy hiệu (Badge) trong hệ thống gamification.
 * Được seed khi khởi động app bởi GamificationDataInitializer.
 */
@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_url")
    private String iconUrl;

    /**
     * Điều kiện để nhận badge (enum-like string).
     * Các giá trị hợp lệ:
     * - FIRST_SESSION     : tham gia buổi đầu tiên
     * - SESSIONS_10       : tham gia 10 buổi
     * - SESSIONS_50       : tham gia 50 buổi
     * - REFERRER          : giới thiệu ít nhất 1 người
     * - VOCABULARY_STAR   : từ vựng được khen ≥ 10 lần
     * - POINTS_500        : đạt 500 điểm
     * - POINTS_2000       : đạt 2000 điểm
     *
     * NOTE: Dùng @Column(name = "badge_condition") thay vì "condition"
     * vì "condition" là reserved keyword trong MySQL.
     */
    @Column(name = "badge_condition", nullable = false, length = 50)
    private String condition;
}
