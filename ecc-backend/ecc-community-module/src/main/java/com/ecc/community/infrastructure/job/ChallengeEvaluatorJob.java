package com.ecc.community.infrastructure.job;

import com.ecc.community.application.port.in.ChallengeUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class ChallengeEvaluatorJob {

    private final ChallengeUseCase challengeUseCase;

    // Cứ mỗi 1 tiếng (3,600,000 ms) chạy 1 lần để check xem ai hoàn thành chưa
    // Để test nhanh ở Local, bạn có thể đổi thành @Scheduled(fixedRate = 60000) (mỗi 1 phút)
    @Scheduled(fixedRate = 3600000)
    public void runEvaluation() {
        log.info("⏰ Bắt đầu chạy Job đánh giá thử thách tự động...");
        challengeUseCase.evaluateOngoingChallenges();
        log.info("⏰ Hoàn tất đánh giá thử thách.");
    }
}