package com.ecc.identity.application.port.out;

import java.util.List;

public interface UserInterestRepositoryPort {
    List<Long> getInterestCategoryIds(Long userId);
    void updateInterests(Long userId, List<Long> categoryIds);
}