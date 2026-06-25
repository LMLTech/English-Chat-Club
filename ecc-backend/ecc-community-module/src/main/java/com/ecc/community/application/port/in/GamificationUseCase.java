package com.ecc.community.application.port.in;

import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.domain.model.PointTransaction;
import com.ecc.community.domain.model.UserBadge;

import java.util.List;

/**
 * Inbound port: các use case gamification mà Controller sẽ gọi.
 */
public interface GamificationUseCase {

    /** Lấy thông tin điểm và level của user hiện tại */
    MemberPoints getMyPoints(Long userId);

    /** Lấy lịch sử giao dịch điểm */
    List<PointTransaction> getMyTransactions(Long userId);

    /** Lấy danh sách badge đã nhận */
    List<UserBadge> getMyBadges(Long userId);
}
