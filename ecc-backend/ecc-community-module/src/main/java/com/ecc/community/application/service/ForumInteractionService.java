package com.ecc.community.application.service;

import com.ecc.common.event.ForumPostLikedEvent;
import com.ecc.community.domain.model.forum.ContentStatus;
import com.ecc.community.domain.model.forum.ForumPost;
import com.ecc.community.domain.model.forum.PostLike;
import com.ecc.community.domain.model.forum.SavedPost;
import com.ecc.community.infrastructure.repository.ForumPostRepository;
import com.ecc.community.infrastructure.repository.PostLikeRepository;
import com.ecc.community.infrastructure.repository.SavedPostRepository;
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

    private final ForumPostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final SavedPostRepository savedPostRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public boolean toggleLike(Long userId, Long postId) {
        ForumPost post = getActivePost(postId);
        Optional<PostLike> existingLike = postLikeRepository.findByPostIdAndUserId(postId, userId);

        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get());
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            postRepository.save(post);
            return false; // unliked
        } else {
            PostLike newLike = PostLike.builder().post(post).userId(userId).build();
            postLikeRepository.save(newLike);
            post.setLikeCount(post.getLikeCount() + 1);
            postRepository.save(post);
            
            // Publish event (TODO: notification later)
            eventPublisher.publishEvent(new ForumPostLikedEvent(postId, userId));
            return true; // liked
        }
    }

    @Transactional
    public boolean toggleSave(Long userId, Long postId) {
        ForumPost post = getActivePost(postId);
        Optional<SavedPost> existingSave = savedPostRepository.findByPostIdAndUserId(postId, userId);

        if (existingSave.isPresent()) {
            savedPostRepository.delete(existingSave.get());
            return false; // unsaved
        } else {
            SavedPost newSave = SavedPost.builder().post(post).userId(userId).build();
            savedPostRepository.save(newSave);
            return true; // saved
        }
    }

    @Transactional(readOnly = true)
    public Page<SavedPost> getSavedPosts(Long userId, Pageable pageable) {
        return savedPostRepository.findByUserId(userId, pageable);
    }

    private ForumPost getActivePost(Long postId) {
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));
        if (post.getStatus() != ContentStatus.PUBLISHED) {
            throw new IllegalStateException("Bài viết không khả dụng");
        }
        return post;
    }
}
