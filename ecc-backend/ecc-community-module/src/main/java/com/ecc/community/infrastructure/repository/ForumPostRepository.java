package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.forum.ContentStatus;
import com.ecc.community.domain.model.forum.ForumPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {
    Page<ForumPost> findByStatus(ContentStatus status, Pageable pageable);
    Page<ForumPost> findByCategoryIdAndStatus(Long categoryId, ContentStatus status, Pageable pageable);
    Page<ForumPost> findByAuthorIdAndStatusNot(Long authorId, ContentStatus excludedStatus, Pageable pageable);
}
