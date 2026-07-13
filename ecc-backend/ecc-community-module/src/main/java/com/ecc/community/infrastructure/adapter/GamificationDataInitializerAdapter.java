package com.ecc.community.infrastructure.adapter;

import com.ecc.community.domain.model.Badge;
import com.ecc.community.domain.model.LevelConfig;
import com.ecc.community.infrastructure.repository.BadgeRepository;
import com.ecc.community.infrastructure.repository.LevelConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class GamificationDataInitializerAdapter implements CommandLineRunner {

    private final LevelConfigRepository levelConfigRepository;
    private final BadgeRepository badgeRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedLevelConfigs();
        seedBadges();
    }

    private void seedLevelConfigs() {
        log.info("⏳ [Gamification] Đang seed/cập nhật LevelConfig...");
        levelConfigRepository.saveAll(java.util.List.of(
                LevelConfig.builder().level(1).requiredPoints(0).title("Bậc A1").build(),
                LevelConfig.builder().level(2).requiredPoints(1000).title("Bậc A2").build(),
                LevelConfig.builder().level(3).requiredPoints(3000).title("Bậc B1").build(),
                LevelConfig.builder().level(4).requiredPoints(6000).title("Bậc B2").build(),
                LevelConfig.builder().level(5).requiredPoints(10000).title("Bậc C1").build(),
                LevelConfig.builder().level(6).requiredPoints(15000).title("Bậc C2").build()
        ));
        log.info("✅ [Gamification] Đã seed 6 LevelConfig.");
    }

    private void seedBadges() {
        if (badgeRepository.count() > 0) return;

        log.info("⏳ [Gamification] Đang seed Badge...");
        badgeRepository.saveAll(java.util.List.of(
                Badge.builder()
                        .name("First Step")
                        .description("Hoàn thành buổi học đầu tiên")
                        .iconUrl("/badges/first-step.svg")
                        .condition("FIRST_SESSION")
                        .build(),
                Badge.builder()
                        .name("Regular Learner")
                        .description("Tham gia 10 buổi học")
                        .iconUrl("/badges/regular-learner.svg")
                        .condition("SESSIONS_10")
                        .build(),
                Badge.builder()
                        .name("Dedicated Scholar")
                        .description("Tham gia 50 buổi học")
                        .iconUrl("/badges/dedicated-scholar.svg")
                        .condition("SESSIONS_50")
                        .build(),
                Badge.builder()
                        .name("Community Builder")
                        .description("Giới thiệu ít nhất 1 thành viên mới")
                        .iconUrl("/badges/community-builder.svg")
                        .condition("REFERRER")
                        .build(),
                Badge.builder()
                        .name("Vocabulary Star")
                        .description("Từ vựng của bạn được khen ít nhất 10 lần")
                        .iconUrl("/badges/vocabulary-star.svg")
                        .condition("VOCABULARY_STAR")
                        .build(),
                Badge.builder()
                        .name("Rising Star")
                        .description("Đạt 500 điểm tích lũy")
                        .iconUrl("/badges/rising-star.svg")
                        .condition("POINTS_500")
                        .build(),
                Badge.builder()
                        .name("ECC Champion")
                        .description("Đạt 2000 điểm tích lũy")
                        .iconUrl("/badges/ecc-champion.svg")
                        .condition("POINTS_2000")
                        .build()
        ));
        log.info("✅ [Gamification] Đã seed 7 Badge.");
    }
}
