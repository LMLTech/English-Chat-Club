package com.ecc.session.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "waiting_list",
    uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "session_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaitingList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // LƯU Ý KIẾN TRÚC: Lưu ID thay vì @ManyToOne để không phụ thuộc module chéo
    @Column(name = "member_id", nullable = false)
    private Long memberId;

    // Nối với Session trong cùng module → dùng @ManyToOne được
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    // Vị trí trong hàng chờ FIFO: 1 = đầu hàng (được promote trước)
    @Column(name = "position", nullable = false)
    private Integer position;


    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "confirm_deadline")
    private LocalDateTime confirmDeadline;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
