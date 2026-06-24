package com.ecc.community.application.service;

import com.ecc.community.domain.model.forum.ContentStatus;
import com.ecc.community.domain.model.forum.ForumCategory;
import com.ecc.community.domain.model.forum.ForumPost;
import com.ecc.community.infrastructure.repository.ForumCategoryRepository;
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
public class ForumPostService {

    private final ForumPostRepository postRepository;
    private final ForumCategoryRepository categoryRepository;

    @Transactional
    public ForumPost createPost(Long authorId, Long categoryId, String title, String content, boolean requireApproval) {
        ForumCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category không tồn tại"));

        ContentStatus status = requireApproval ? ContentStatus.PENDING : ContentStatus.PUBLISHED;

        ForumPost post = ForumPost.builder()
                .category(category)
                .authorId(authorId)
                .title(title)
                .content(content)
                .status(status)
                .build();

        return postRepository.save(post);
    }

    @Transactional
    public ForumPost updatePost(Long authorId, Long postId, String title, String content) {
        ForumPost post = getPostById(postId);
        if (!post.getAuthorId().equals(authorId)) {
            throw new SecurityException("Không có quyền sửa bài viết này");
        }
        if (post.getStatus() == ContentStatus.DELETED || post.getStatus() == ContentStatus.HIDDEN) {
            throw new IllegalStateException("Không thể sửa bài viết đã bị xoá hoặc ẩn");
        }

        post.setTitle(title);
        post.setContent(content);
        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long authorId, Long postId) {
        ForumPost post = getPostById(postId);
        if (!post.getAuthorId().equals(authorId)) {
            throw new SecurityException("Không có quyền xoá bài viết này");
        }
        post.setStatus(ContentStatus.DELETED);
        postRepository.save(post);
    }

    @Transactional
    public ForumPost viewPost(Long postId) {
        ForumPost post = getPostById(postId);
        if (post.getStatus() != ContentStatus.PUBLISHED) {
            throw new IllegalStateException("Bài viết không khả dụng");
        }
        post.setViewCount(post.getViewCount() + 1);
        return postRepository.save(post);
    }

    @Transactional(readOnly = true)
    public Page<ForumPost> getPublishedPosts(Long categoryId, Pageable pageable) {
        if (categoryId != null) {
            return postRepository.findByCategoryIdAndStatus(categoryId, ContentStatus.PUBLISHED, pageable);
        }
        return postRepository.findByStatus(ContentStatus.PUBLISHED, pageable);
    }

    private ForumPost getPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));
    }
}
