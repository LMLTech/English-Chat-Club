package com.ecc.community.application.service;

import com.ecc.community.application.port.out.ForumCategoryPort;
import com.ecc.community.application.port.out.ForumPostPort;
import com.ecc.community.domain.model.ContentStatus;
import com.ecc.community.domain.model.ForumCategory;
import com.ecc.community.domain.model.ForumPost;
import com.ecc.common.util.BadWordFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForumPostService {

    // CHUẨN HEXAGONAL: Chỉ giao tiếp qua Port Out, tuyệt đối không dùng JPA Repository ở đây
    private final ForumPostPort forumPostPort;
    private final ForumCategoryPort forumCategoryPort;
    private final BadWordFilter badWordFilter; // Port: Bộ lọc từ cấm

    @Transactional
    public ForumPost createPost(Long authorId, Long categoryId, String title, String content, boolean requireApproval) {
        ForumCategory category = forumCategoryPort.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category không tồn tại"));

        ContentStatus status = requireApproval ? ContentStatus.PENDING : ContentStatus.PUBLISHED;

        // Lọc từ cấm trong tiêu đề và nội dung bài viết
        String filteredTitle = badWordFilter.filter(title);
        String filteredContent = badWordFilter.filter(content);

        // LOGIC DB: Tạo slug duy nhất từ title gốc (không dùng title đã filter để giữ slug sạch)
        String slug = generateSlug(title);

        ForumPost post = ForumPost.builder()
                .category(category)
                .authorId(authorId)
                .title(filteredTitle)
                .slug(slug)
                .content(filteredContent)
                .status(status)
                .build();

        return forumPostPort.save(post);
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

        post.setTitle(badWordFilter.filter(title));
        post.setContent(badWordFilter.filter(content));
        // Lưu ý: Thông thường khi update bài viết, ta giữ nguyên slug để không làm hỏng URL đã được index
        return forumPostPort.save(post);
    }

    @Transactional
    public void deletePost(Long authorId, Long postId) {
        ForumPost post = getPostById(postId);
        if (!post.getAuthorId().equals(authorId)) {
            throw new SecurityException("Không có quyền xoá bài viết này");
        }

        post.setStatus(ContentStatus.DELETED);
        // LOGIC DB: Phải có thời gian xóa mềm
        post.setDeletedAt(LocalDateTime.now());

        forumPostPort.save(post);
    }

    @Transactional
    public ForumPost viewPost(Long postId) {
        ForumPost post = getPostById(postId);
        if (post.getStatus() != ContentStatus.PUBLISHED) {
            throw new IllegalStateException("Bài viết không khả dụng");
        }
        post.setViewCount(post.getViewCount() + 1);
        return forumPostPort.save(post);
    }

    @Transactional(readOnly = true)
    public Page<ForumPost> getPublishedPosts(Long categoryId, Pageable pageable) {
        if (categoryId != null) {
            return forumPostPort.findByCategoryIdAndStatus(categoryId, ContentStatus.PUBLISHED, pageable);
        }
        return forumPostPort.findByStatus(ContentStatus.PUBLISHED, pageable);
    }

    private ForumPost getPostById(Long postId) {
        return forumPostPort.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));
    }

    // Tiện ích: Tạo chuỗi Slug thân thiện với URL (vd: "Học Tiếng Anh" -> "hoc-tieng-anh-1718301234567")
    private String generateSlug(String input) {
        if (input == null || input.isEmpty()) return String.valueOf(System.currentTimeMillis());

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String slug = Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
        slug = slug.toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", "-");

        return slug + "-" + System.currentTimeMillis();
    }
}