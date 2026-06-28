package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.UserBadge;
import java.util.List;

public interface UserBadgePort {
    List<UserBadge> findByUserId(Long userId);
    boolean existsByUserIdAndBadge_Condition(Long userId, String condition);
    UserBadge save(UserBadge userBadge);
}