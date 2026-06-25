package com.ecc.community.domain.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Bảng cấu hình cấp độ (Level).
 * Được seed khi khởi động app bởi GamificationDataInitializer.
 * level = PK (1, 2, 3, ...)
 * requiredPoints = số điểm tối thiểu để đạt level này
 */
@Entity
@Table(name = "level_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LevelConfig {

    @Id
    @Column(nullable = false)
    private Integer level;

    // Số điểm tối thiểu cần có để ở level này
    @Column(name = "required_points", nullable = false)
    private Integer requiredPoints;

    // Danh hiệu hiển thị cho user
    @Column(nullable = false, length = 50)
    private String title;
}
