package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.Session;

import java.time.LocalDateTime;
import java.util.Optional;

public interface SessionRepositoryPort {
    Session save(Session session);
    Optional<Session> findById(Long id);

    /**
     * Tăng current_participants lên 1 theo cách atomic (tránh race condition).
     * Câu UPDATE chỉ chạy khi current_participants < max_participants.
     * @return số dòng bị ảnh hưởng: 1 = thành công, 0 = phòng đầy
     */
    int tryIncrementParticipants(Long sessionId);

    /**
     * Kiểm tra user đã có booking CONFIRMED nào trùng khung giờ với session hiện tại chưa.
     * Dùng để ngăn đặt chỗ trùng lịch.
     */
    boolean hasConflictingBooking(Long memberId, LocalDateTime startTime, LocalDateTime endTime, Long excludeSessionId);
}