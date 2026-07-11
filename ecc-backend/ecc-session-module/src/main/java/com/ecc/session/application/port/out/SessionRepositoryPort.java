package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.Session;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SessionRepositoryPort {
    Session save(Session session);
    Optional<Session> findById(Long id);
    List<Session> findAll();
    List<Session> findByEndTimeBeforeAndStatusIn(LocalDateTime endTime, List<String> statuses);

    /**
     * Tăng current_participants lên 1 theo cách atomic (tránh race condition).
     * Câu UPDATE chỉ chạy khi current_participants < max_participants.
     * @return số dòng bị ảnh hưởng: 1 = thành công, 0 = phòng đầy
     */
    int tryIncrementParticipants(Long sessionId);

    /**
     * Giảm current_participants xuống 1 theo cách atomic.
     * Điều kiện: current_participants > 0 (không âm).
     * @return số dòng bị ảnh hưởng: 1 = thành công
     */
    int tryDecrementParticipants(Long sessionId);

    /**
     * Kiểm tra user đã có booking CONFIRMED nào trùng khung giờ với session hiện tại chưa.
     * Dùng để ngăn đặt chỗ trùng lịch.
     */
    boolean hasConflictingBooking(Long memberId, LocalDateTime startTime, LocalDateTime endTime, Long excludeSessionId);
}
