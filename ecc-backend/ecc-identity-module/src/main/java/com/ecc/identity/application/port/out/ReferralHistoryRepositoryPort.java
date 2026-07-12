package com.ecc.identity.application.port.out;

import com.ecc.identity.domain.model.ReferralHistory;

public interface ReferralHistoryRepositoryPort {
    ReferralHistory save(ReferralHistory referralHistory);
}
