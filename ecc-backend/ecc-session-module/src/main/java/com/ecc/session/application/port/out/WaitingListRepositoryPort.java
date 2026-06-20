package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.WaitingList;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WaitingListRepositoryPort {

    /** Lưu entry vào hàng chờ */
    WaitingList save(WaitingList entry);

    /** Kiểm tra user đã có trong hàng chờ của session này chưa */
    boolean existsByMemberIdAndSessionId(Long memberId, Long sessionId);

    /** Đếm số người đang chờ để xác định position tiếp theo */
    int countBySessionId(Long sessionId);

    /** Lấy người đầu hàng chờ (position nhỏ nhất, status=WAITING) để auto-promote */
    Optional<WaitingList> findFirstWaitingBySessionId(Long sessionId);

    /** Tìm entry PENDING_CONFIRM của một member trong một session */
    Optional<WaitingList> findPendingConfirmByMemberIdAndSessionId(Long memberId, Long sessionId);

    /** Lấy tất cả PENDING_CONFIRM đã quá deadline (dùng bởi scheduler) */
    List<WaitingList> findAllExpiredPendingConfirm(LocalDateTime now);
}
