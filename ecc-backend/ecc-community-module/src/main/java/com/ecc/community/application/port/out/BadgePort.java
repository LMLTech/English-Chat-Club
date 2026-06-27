package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.Badge;
import java.util.Optional;

public interface BadgePort {
    Optional<Badge> findByCondition(String condition);
    boolean existsByCondition(String condition);
}