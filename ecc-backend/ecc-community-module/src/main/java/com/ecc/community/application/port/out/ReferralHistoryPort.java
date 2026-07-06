package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.ReferralHistory;
import java.util.Optional;

public interface ReferralHistoryPort {
    Optional<ReferralHistory> findPendingReferralByReferredUserId(Long referredUserId);
    ReferralHistory save(ReferralHistory referralHistory);
}