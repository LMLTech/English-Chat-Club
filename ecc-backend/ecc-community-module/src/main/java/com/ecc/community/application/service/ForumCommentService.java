package com.ecc.community.application.service;

import com.ecc.common.event.ForumPostCommentedEvent;
import com.ecc.community.domain.model.forum.ContentStatus;
import com.ecc.community.domain.model.forum.ForumComment;
import com.ecc.community.domain.model.forum.ForumPost;
import com.ecc.community.infrastructure.repository.ForumCommentRepository;
import com.ecc.community.infrastructure.repository.ForumPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForumCommentService {

    private final ForumCommentRepository commentRepository;
    private final ForumPostRepository postRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ForumComment createRootComment(Long authorId, Long postId, String content) {
        ForumPost post = getActivePost(postId);

        ForumComment comment = ForumComment.builder()
                .post(post)
                .parent(null) // Root comment
                .authorId(authorId)
                .content(content)
                .status(ContentStatus.PUBLISHED)
                .build();

        ForumComment savedComment = commentRepository.save(comment);

        // Update post comment count
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        // Event for notification
        eventPublisher.publishEvent(new ForumPostCommentedEvent(postId, savedComment.getId(), authorId));

        return savedComment;
    }

    @Transactional
    public ForumComment createReply(Long authorId, Long parentCommentId, String content) {
        ForumComment targetComment = getActiveComment(parentCommentId);
        ForumPost post = targetComment.getPost();

        // Normalize parent: if user replies to a reply (level 2+), attach it to the root comment (level 1)
        ForumComment actualParent = targetComment.getParent() == null ? targetComment : targetComment.getParent();

        ForumComment reply = ForumComment.builder()
                .post(post)
                .parent(actualParent)
                .authorId(authorId)
                .content(content)
                .status(ContentStatus.PUBLISHED)
                .build();

        ForumComment savedReply = commentRepository.save(reply);

        // Update counts
        actualParent.setReplyCount(actualParent.getReplyCount() + 1);
        commentRepository.save(actualParent);

        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        // Event for notification
        eventPublisher.publishEvent(new ForumPostCommentedEvent(post.getId(), savedReply.getId(), authorId));

        return savedReply;
    }

    @Transactional
    public void deleteComment(Long authorId, Long commentId) {
        ForumComment comment = getActiveComment(commentId);
        if (!comment.getAuthorId().equals(authorId)) {
            throw new SecurityException("Không có quyền xoá bình luận này");
        }
        comment.setStatus(ContentStatus.DELETED);
        commentRepository.save(comment);
        
        // Note: we don't decrement commentCount because it's soft delete, 
        // and usually we want to show [Deleted] in UI.
    }

    @Transactional(readOnly = true)
    public Page<ForumComment> getRootComments(Long postId, Pageable pageable) {
        return commentRepository.findByPostIdAndParentIsNullAndStatus(postId, ContentStatus.PUBLISHED, pageable);
    }

    @Transactional(readOnly = true)
    public List<ForumComment> getReplies(Long rootCommentId) {
        return commentRepository.findByParentIdAndStatusOrderByCreatedAtAsc(rootCommentId, ContentStatus.PUBLISHED);
    }

    private ForumPost getActivePost(Long postId) {
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));
        if (post.getStatus() != ContentStatus.PUBLISHED) {
            throw new IllegalStateException("Bài viết không khả dụng");
        }
        return post;
    }

    private ForumComment getActiveComment(Long commentId) {
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Bình luận không tồn tại"));
        if (comment.getStatus() != ContentStatus.PUBLISHED) {
            throw new IllegalStateException("Bình luận không khả dụng");
        }
        return comment;
    }
}
