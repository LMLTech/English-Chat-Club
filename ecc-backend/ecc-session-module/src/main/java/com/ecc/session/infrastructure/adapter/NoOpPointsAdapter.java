package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.PointsPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Stub implementation của PointsPort.
 * Dùng tạm thời cho đến khi ecc-gamification-module được xây dựng.
 * Khi gamification module sẵn sàng, thay bằng adapter thực tế hoặc
 * dùng ApplicationEventPublisher + lắng nghe LateBookingCancelEvent.
 */
@Slf4j
@Component
public class NoOpPointsAdapter implements PointsPort {

    @Override
    public void deductPoints(Long memberId, int points, String reason) {
        // TODO: Replace with actual gamification module call
        log.warn("[POINTS] Deduct {} points from memberId={}, reason={} (NoOp – gamification not implemented yet)",
                points, memberId, reason);
    }

    @Override
    public void addPoints(Long memberId, int points, String reason) {
        // TODO: Replace with actual gamification module call
        log.warn("[POINTS] Add {} points to memberId={}, reason={} (NoOp – gamification not implemented yet)", 
                 points, memberId, reason);
    }
}
