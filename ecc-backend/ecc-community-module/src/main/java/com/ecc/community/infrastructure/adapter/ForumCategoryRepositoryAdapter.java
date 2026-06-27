package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.ForumCategoryPort;
import com.ecc.community.domain.model.ForumCategory;
import com.ecc.community.infrastructure.repository.ForumCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ForumCategoryRepositoryAdapter implements ForumCategoryPort {

    private final ForumCategoryRepository categoryRepository;

    @Override
    public Optional<ForumCategory> findById(Long id) {
        return categoryRepository.findById(id);
    }
}