package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.ForumCommentPort;
import com.ecc.community.domain.model.ContentStatus;
import com.ecc.community.domain.model.ForumComment;
import com.ecc.community.infrastructure.repository.ForumCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ForumCommentRepositoryAdapter implements ForumCommentPort {

    private final ForumCommentRepository commentRepository;

    @Override
    public ForumComment save(ForumComment comment) {
        return commentRepository.save(comment);
    }

    @Override
    public Optional<ForumComment> findById(Long id) {
        return commentRepository.findById(id);
    }

    @Override
    public Page<ForumComment> findByPostIdAndParentIsNullAndStatus(Long postId, ContentStatus status, Pageable pageable) {
        return commentRepository.findByPostIdAndParentIsNullAndStatus(postId, status, pageable);
    }

    @Override
    public List<ForumComment> findByParentIdAndStatusOrderByCreatedAtAsc(Long parentId, ContentStatus status) {
        return commentRepository.findByParentIdAndStatusOrderByCreatedAtAsc(parentId, status);
    }
}