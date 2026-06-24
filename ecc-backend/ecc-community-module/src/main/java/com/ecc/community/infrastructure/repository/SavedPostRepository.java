package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.forum.SavedPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    Optional<SavedPost> findByPostIdAndUserId(Long postId, Long userId);
    Page<SavedPost> findByUserId(Long userId, Pageable pageable);
}
