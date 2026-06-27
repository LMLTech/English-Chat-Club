package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.ContentStatus;
import com.ecc.community.domain.model.ForumPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {

    @EntityGraph(attributePaths = {"category"})
    Page<ForumPost> findByStatus(ContentStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<ForumPost> findByCategoryIdAndStatus(Long categoryId, ContentStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    Page<ForumPost> findByAuthorIdAndStatusNot(Long authorId, ContentStatus excludedStatus, Pageable pageable);
}