package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.ForumCategory;
import java.util.Optional;

public interface ForumCategoryPort {
    Optional<ForumCategory> findById(Long id);
}