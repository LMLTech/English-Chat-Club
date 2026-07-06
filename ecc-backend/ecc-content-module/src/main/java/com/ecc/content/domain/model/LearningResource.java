package com.ecc.content.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    // VIDEO, PDF, LINK, OTHER
    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false, length = 255)
    private String url;

    @Column(length = 100)
    private String category;

    // Chỉ lưu ID để không phụ thuộc cứng vào Identity Module
    @Column(name = "uploaded_by", nullable = false)
    private Long uploadedBy;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Domain logic: Soft delete
    public void softDelete() {
        this.isActive = false;
        this.deletedAt = LocalDateTime.now();
    }
}