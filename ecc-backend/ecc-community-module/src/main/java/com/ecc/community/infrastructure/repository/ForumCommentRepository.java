package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.ContentStatus;
import com.ecc.community.domain.model.ForumComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumCommentRepository extends JpaRepository<ForumComment, Long> {
    Page<ForumComment> findByPostIdAndParentIsNullAndStatus(Long postId, ContentStatus status, Pageable pageable);
    List<ForumComment> findByParentIdAndStatusOrderByCreatedAtAsc(Long parentId, ContentStatus status);
}
