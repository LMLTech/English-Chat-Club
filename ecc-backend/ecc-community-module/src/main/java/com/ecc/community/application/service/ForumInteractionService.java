package com.ecc.community.application.service;

import com.ecc.common.event.ForumPostLikedEvent;
import com.ecc.community.application.port.out.ForumPostPort;
import com.ecc.community.application.port.out.PostLikePort;
import com.ecc.community.application.port.out.SavedPostPort;
import com.ecc.community.domain.model.ContentStatus;
import com.ecc.community.domain.model.ForumPost;
import com.ecc.community.domain.model.PostLike;
import com.ecc.community.domain.model.SavedPost;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForumInteractionService {

    // CHUẨN HEXAGONAL: Giao tiếp qua Port
    private final ForumPostPort forumPostPort;
    private final PostLikePort postLikePort;
    private final SavedPostPort savedPostPort;

    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public boolean toggleLike(Long userId, Long postId) {
        ForumPost post = getActivePost(postId);
        Optional<PostLike> existingLike = postLikePort.findByPostIdAndUserId(postId, userId);

        if (existingLike.isPresent()) {
            postLikePort.delete(existingLike.get());
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            forumPostPort.save(post);
            return false; // unliked
        } else {
            PostLike newLike = PostLike.builder().post(post).userId(userId).build();
            postLikePort.save(newLike);
            post.setLikeCount(post.getLikeCount() + 1);
            forumPostPort.save(post);

            // Publish event (TODO: notification later)
            eventPublisher.publishEvent(new ForumPostLikedEvent(postId, userId));
            return true; // liked
        }
    }

    @Transactional
    public boolean toggleSave(Long userId, Long postId) {
        ForumPost post = getActivePost(postId);
        Optional<SavedPost> existingSave = savedPostPort.findByPostIdAndUserId(postId, userId);

        if (existingSave.isPresent()) {
            savedPostPort.delete(existingSave.get());
            return false; // unsaved
        } else {
            SavedPost newSave = SavedPost.builder().post(post).userId(userId).build();
            savedPostPort.save(newSave);
            return true; // saved
        }
    }

    @Transactional(readOnly = true)
    public Page<SavedPost> getSavedPosts(Long userId, Pageable pageable) {
        return savedPostPort.findByUserId(userId, pageable);
    }

    private ForumPost getActivePost(Long postId) {
        return forumPostPort.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));
    }
}