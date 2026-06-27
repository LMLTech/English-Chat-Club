package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.ForumPostPort;
import com.ecc.community.domain.model.ContentStatus;
import com.ecc.community.domain.model.ForumPost;
import com.ecc.community.infrastructure.repository.ForumPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ForumPostRepositoryAdapter implements ForumPostPort {

    // Đây là nơi duy nhất được gọi JPA Repository
    private final ForumPostRepository forumPostRepository;

    @Override
    public ForumPost save(ForumPost post) {
        return forumPostRepository.save(post);
    }

    @Override
    public Optional<ForumPost> findById(Long id) {
        return forumPostRepository.findById(id);
    }

    @Override
    public Page<ForumPost> findByStatus(ContentStatus status, Pageable pageable) {
        return forumPostRepository.findByStatus(status, pageable);
    }

    @Override
    public Page<ForumPost> findByCategoryIdAndStatus(Long categoryId, ContentStatus status, Pageable pageable) {
        return forumPostRepository.findByCategoryIdAndStatus(categoryId, status, pageable);
    }
}