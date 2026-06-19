package com.ecc.session.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // UUID dùng để public ra ngoài URL thay vì dùng ID tự tăng (bảo mật hơn)
    @Column(nullable = false, unique = true, updatable = false, columnDefinition = "BINARY(16)")
    private UUID uuid;

    // Nối với bảng DiscussionTopic (cùng nằm trong module Session nên nối trực tiếp được)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private DiscussionTopic topic;

    // LƯU Ý KIẾN TRÚC: Lưu ID của Moderator (User) thay vì @ManyToOne để tách biệt module
    @Column(name = "moderator_id", nullable = false)
    private Long moderatorId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "max_participants", nullable = false)
    private Integer maxParticipants;

    // Biến này cực kỳ quan trọng ở Flow 2.3 để chặn Race Condition (tránh việc cháy phòng)
    @Builder.Default
    @Column(name = "current_participants", nullable = false)
    private Integer currentParticipants = 0;

    @Column(name = "required_level", length = 5)
    private String requiredLevel; // Ví dụ: A1, B2... có thể null nếu phòng mở tự do

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    // SCHEDULED, ONGOING, COMPLETED, CANCELLED
    @Column(nullable = false, length = 20)
    private String status;

    // PENDING_APPROVAL (chờ duyệt), APPROVED (đã duyệt), REJECTED (từ chối)
    @Column(name = "room_status", nullable = false, length = 20)
    private String roomStatus;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}