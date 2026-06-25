package com.ecc.community.infrastructure.adapter;

import com.ecc.community.domain.model.forum.ForumCategory;
import com.ecc.community.infrastructure.repository.ForumCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seed dữ liệu mặc định cho Diễn đàn (Forum) khi khởi động app.
 * Chạy sau GamificationDataInitializer (@Order(3)).
 */
@Slf4j
@Component
@Order(3)
@RequiredArgsConstructor
public class ForumDataInitializer implements CommandLineRunner {

    private final ForumCategoryRepository categoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() > 0) return;

        log.info("⏳ [Forum] Đang seed ForumCategory...");
        categoryRepository.saveAll(List.of(
                ForumCategory.builder()
                        .name("Thảo luận chung")
                        .description("Nơi giao lưu, trò chuyện các chủ đề chung về tiếng Anh.")
                        .displayOrder(1)
                        .build(),
                ForumCategory.builder()
                        .name("Hỏi đáp Tiếng Anh")
                        .description("Đặt câu hỏi và nhận giải đáp từ cộng đồng.")
                        .displayOrder(2)
                        .build(),
                ForumCategory.builder()
                        .name("Chia sẻ tài liệu")
                        .description("Chia sẻ sách, tài liệu, kinh nghiệm học tập.")
                        .displayOrder(3)
                        .build()
        ));
        log.info("✅ [Forum] Đã seed 3 ForumCategory.");
    }
}
