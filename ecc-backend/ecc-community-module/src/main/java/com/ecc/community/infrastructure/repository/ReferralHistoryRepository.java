package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.ReferralHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// ĐẶT TÊN BEAN CỤ THỂ ĐỂ KHÔNG BỊ TRÙNG VỚI MODULE IDENTITY
@Repository("communityReferralHistoryRepository")
public interface ReferralHistoryRepository extends JpaRepository<ReferralHistory, Long> {

    // Tìm bản ghi giới thiệu của một user mới (chưa được trả thưởng)
    Optional<ReferralHistory> findByReferredUserIdAndStatusNot(Long referredUserId, String status);
}