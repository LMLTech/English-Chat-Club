package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.ContentStatus;
import com.ecc.community.domain.model.ForumComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ForumCommentPort {
    ForumComment save(ForumComment comment);
    Optional<ForumComment> findById(Long id);
    Page<ForumComment> findByPostIdAndParentIsNullAndStatus(Long postId, ContentStatus status, Pageable pageable);
    List<ForumComment> findByParentIdAndStatusOrderByCreatedAtAsc(Long parentId, ContentStatus status);
}