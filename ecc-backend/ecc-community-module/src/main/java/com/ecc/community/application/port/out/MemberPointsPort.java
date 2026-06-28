package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.MemberPoints;
import java.util.Optional;

public interface MemberPointsPort {
    Optional<MemberPoints> findByUserId(Long userId);
    MemberPoints save(MemberPoints memberPoints);
}