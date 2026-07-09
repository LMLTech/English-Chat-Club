package com.ecc.community.application.service;

import com.ecc.common.event.ForumPostCommentedEvent;
import com.ecc.common.util.BadWordFilter;
import com.ecc.community.application.port.out.ForumCommentPort;
import com.ecc.community.application.port.out.ForumPostPort;
import com.ecc.community.domain.model.ContentStatus;
import com.ecc.community.domain.model.ForumComment;
import com.ecc.community.domain.model.ForumPost;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForumCommentService {

    private final ForumCommentPort forumCommentPort;
    private final ForumPostPort forumPostPort;
    private final ApplicationEventPublisher eventPublisher;
    private final BadWordFilter badWordFilter; // Port: Bộ lọc từ cấm

    @Transactional
    public ForumComment createRootComment(Long authorId, Long postId, String content) {
        ForumPost post = getActivePost(postId);

        // Lọc từ cấm trong nội dung bình luận
        String filteredContent = badWordFilter.filter(content);

        ForumComment comment = ForumComment.builder()
                .post(post)
                .parent(null)
                .authorId(authorId)
                .content(filteredContent)
                .status(ContentStatus.PUBLISHED)
                .build();

        ForumComment savedComment = forumCommentPort.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        forumPostPort.save(post);

        eventPublisher.publishEvent(new ForumPostCommentedEvent(postId, savedComment.getId(), authorId));

        return savedComment;
    }

    @Transactional
    public ForumComment createReply(Long authorId, Long parentCommentId, String content) {
        ForumComment targetComment = getActiveComment(parentCommentId);
        ForumPost post = targetComment.getPost();

        ForumComment actualParent = targetComment.getParent() == null ? targetComment : targetComment.getParent();

        // Lọc từ cấm trong nội dung reply
        String filteredContent = badWordFilter.filter(content);

        ForumComment reply = ForumComment.builder()
                .post(post)
                .parent(actualParent)
                .authorId(authorId)
                .content(filteredContent)
                .status(ContentStatus.PUBLISHED)
                .build();

        ForumComment savedReply = forumCommentPort.save(reply);

        actualParent.setReplyCount(actualParent.getReplyCount() + 1);
        forumCommentPort.save(actualParent);

        post.setCommentCount(post.getCommentCount() + 1);
        forumPostPort.save(post);

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
        // FIX: Cập nhật thời gian xóa mềm
        comment.setDeletedAt(LocalDateTime.now());

        forumCommentPort.save(comment);
    }

    @Transactional(readOnly = true)
    public Page<ForumComment> getRootComments(Long postId, Pageable pageable) {
        return forumCommentPort.findByPostIdAndParentIsNullAndStatus(postId, ContentStatus.PUBLISHED, pageable);
    }

    @Transactional(readOnly = true)
    public List<ForumComment> getReplies(Long rootCommentId) {
        return forumCommentPort.findByParentIdAndStatusOrderByCreatedAtAsc(rootCommentId, ContentStatus.PUBLISHED);
    }

    private ForumPost getActivePost(Long postId) {
        return forumPostPort.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));
    }

    private ForumComment getActiveComment(Long commentId) {
        return forumCommentPort.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Bình luận không tồn tại"));
    }
}