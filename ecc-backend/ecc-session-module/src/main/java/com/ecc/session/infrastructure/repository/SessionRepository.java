package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    /**
     * Tăng current_participants lên 1 một cách atomic (DB-level).
     * Điều kiện: current_participants < max_participants (tránh cháy phòng).
     * Trả về số dòng bị ảnh hưởng: 1 = thành công, 0 = phòng đầy.
     */
    @Modifying
    @Query("UPDATE Session s SET s.currentParticipants = s.currentParticipants + 1 " +
            "WHERE s.id = :sessionId AND s.currentParticipants < s.maxParticipants")
    int tryIncrementParticipants(@Param("sessionId") Long sessionId);

    /**
     * Giảm current_participants xuống 1 một cách atomic (DB-level).
     * Điều kiện: current_participants > 0 (để không bị âm).
     * Trả về số dòng bị ảnh hưởng: 1 = thành công.
     */
    @Modifying
    @Query("UPDATE Session s SET s.currentParticipants = s.currentParticipants - 1 " +
            "WHERE s.id = :sessionId AND s.currentParticipants > 0")
    int tryDecrementParticipants(@Param("sessionId") Long sessionId);

    /**
     * Kiểm tra user có booking CONFIRMED nào trùng khung giờ (startTime, endTime) không.
     * Join với Booking để tìm session mà user đã đặt.
     * excludeSessionId: loại trừ chính session đang xét ra.
     */
    @Query("""
           SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
           FROM Booking b JOIN b.session s
           WHERE b.memberId = :memberId
             AND b.status = 'CONFIRMED'
             AND s.id != :excludeSessionId
             AND s.startTime < :endTime
             AND s.endTime > :startTime
           """)
    boolean hasConflictingBooking(
            @Param("memberId") Long memberId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeSessionId") Long excludeSessionId
    );

    /**
     * Trả về danh sách các Session có endTime < thời điểm hiện tại
     * và đang có trạng thái nằm trong danh sách (vd: SCHEDULED, ONGOING).
     */
    List<Session> findByEndTimeBeforeAndStatusIn(LocalDateTime endTime, List<String> statuses);
}