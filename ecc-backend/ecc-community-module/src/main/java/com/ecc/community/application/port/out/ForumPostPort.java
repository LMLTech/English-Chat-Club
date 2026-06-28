package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.ContentStatus;
import com.ecc.community.domain.model.ForumPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ForumPostPort {
    ForumPost save(ForumPost post);
    Optional<ForumPost> findById(Long id);
    Page<ForumPost> findByStatus(ContentStatus status, Pageable pageable);
    Page<ForumPost> findByCategoryIdAndStatus(Long categoryId, ContentStatus status, Pageable pageable);
}