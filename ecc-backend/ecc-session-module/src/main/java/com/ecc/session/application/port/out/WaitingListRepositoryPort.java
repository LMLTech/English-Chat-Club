package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.WaitingList;

public interface WaitingListRepositoryPort {

    /** Lưu entry vào hàng chờ */
    WaitingList save(WaitingList entry);

    /** Kiểm tra user đã có trong hàng chờ của session này chưa */
    boolean existsByMemberIdAndSessionId(Long memberId, Long sessionId);

    /** Đếm số người đang chờ để xác định position tiếp theo */
    int countBySessionId(Long sessionId);
}
