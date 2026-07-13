package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.MemberPoints;
import java.util.Optional;

public interface MemberPointsPort {
    Optional<MemberPoints> findByUserId(Long userId);
    MemberPoints save(MemberPoints memberPoints);
    java.util.List<MemberPoints> findTopMembersByPointsDesc(int limit);
    java.util.List<java.util.Map<String, Object>> findTopMembersWithUserDetails(int limit);
}