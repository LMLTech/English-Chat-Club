package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.WaitingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaitingListRepository extends JpaRepository<WaitingList, Long> {

    boolean existsByMemberIdAndSessionId(Long memberId, Long sessionId);

    @Query("SELECT COALESCE(MAX(w.position), 0) FROM WaitingList w WHERE w.session.id = :sessionId AND w.status = 'WAITING'")
    int findMaxPositionBySessionId(@Param("sessionId") Long sessionId);

    /**
     * Lấy entry đầu tiên trong hàng chờ (FIFO): position nhỏ nhất và status = WAITING.
     * Dùng để auto-promote khi có chỗ trống.
     */
    @Query("SELECT w FROM WaitingList w WHERE w.session.id = :sessionId AND w.status = 'WAITING' ORDER BY w.position ASC LIMIT 1")
    Optional<WaitingList> findFirstWaitingBySessionId(@Param("sessionId") Long sessionId);

    /**
     * Tìm entry đang chờ xác nhận của một member trong một session.
     * Dùng cho endpoint xác nhận promote.
     */
    @Query("SELECT w FROM WaitingList w WHERE w.memberId = :memberId AND w.session.id = :sessionId AND w.status = 'PENDING_CONFIRM'")
    Optional<WaitingList> findPendingConfirmByMemberIdAndSessionId(
            @Param("memberId") Long memberId,
            @Param("sessionId") Long sessionId
    );

    /**
     * Lấy tất cả PENDING_CONFIRM đã quá hạn (confirmDeadline < now).
     * Dùng bởi scheduler để xử lý timeout.
     */
    @Query("SELECT w FROM WaitingList w WHERE w.status = 'PENDING_CONFIRM' AND w.confirmDeadline < :now")
    List<WaitingList> findAllExpiredPendingConfirm(@Param("now") LocalDateTime now);
}
