package com.ecc.community.application.service;

import com.ecc.community.domain.model.forum.ContentStatus;
import com.ecc.community.domain.model.forum.ForumComment;
import com.ecc.community.domain.model.forum.ForumPost;
import com.ecc.community.infrastructure.repository.ForumCommentRepository;
import com.ecc.community.infrastructure.repository.ForumPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminForumModerationService {

    private final ForumPostRepository postRepository;
    private final ForumCommentRepository commentRepository;

    @Transactional(readOnly = true)
    public Page<ForumPost> getPendingPosts(Pageable pageable) {
        return postRepository.findByStatus(ContentStatus.PENDING, pageable);
    }

    @Transactional
    public ForumPost approvePost(Long postId) {
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));
        
        if (post.getStatus() != ContentStatus.PENDING) {
            throw new IllegalStateException("Bài viết không ở trạng thái chờ duyệt");
        }

        post.setStatus(ContentStatus.PUBLISHED);
        return postRepository.save(post);
    }

    @Transactional
    public ForumPost hidePost(Long postId, String reason) {
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));

        post.setStatus(ContentStatus.HIDDEN);
        log.info("Admin đã ẩn bài viết ID {} với lý do: {}", postId, reason);
        // TODO: Gửi email/notification cho user về lý do ẩn bài viết
        return postRepository.save(post);
    }

    @Transactional
    public ForumComment hideComment(Long commentId, String reason) {
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Bình luận không tồn tại"));

        comment.setStatus(ContentStatus.HIDDEN);
        log.info("Admin đã ẩn bình luận ID {} với lý do: {}", commentId, reason);
        // TODO: Gửi email/notification cho user về lý do ẩn bình luận
        return commentRepository.save(comment);
    }
}
