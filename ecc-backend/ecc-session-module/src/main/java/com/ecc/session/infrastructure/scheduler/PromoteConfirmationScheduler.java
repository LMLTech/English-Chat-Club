package com.ecc.session.infrastructure.scheduler;

import com.ecc.session.application.port.out.WaitingListRepositoryPort;
import com.ecc.session.domain.model.WaitingList;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler kiểm tra các PENDING_CONFIRM đã quá hạn (mỗi 60 giây).
 * Nếu member không xác nhận trong 10 phút → đánh dấu EXPIRED
 * và promote người kế tiếp trong hàng chờ (FIFO).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PromoteConfirmationScheduler {

    // Đổi xuống 1 phút để test nhanh
    private static final int PROMOTE_CONFIRM_MINUTES = 1;

    private final WaitingListRepositoryPort waitingListRepositoryPort;

    /**
     * Chạy mỗi 60 giây để phát hiện và xử lý PENDING_CONFIRM đã hết thời gian.
     */
    @Transactional
    @Scheduled(fixedDelay = 60_000) // 60 giây
    public void processExpiredConfirmations() {
        LocalDateTime now = LocalDateTime.now();
        List<WaitingList> expiredEntries = waitingListRepositoryPort.findAllExpiredPendingConfirm(now);

        if (expiredEntries.isEmpty()) return;

        log.info("[Scheduler] Tìm thấy {} PENDING_CONFIRM hết hạn, đang xử lý...", expiredEntries.size());

        for (WaitingList expired : expiredEntries) {
            Long sessionId = expired.getSession().getId();

            // 1. Đánh dấu EXPIRED
            expired.setStatus("EXPIRED");
            waitingListRepositoryPort.save(expired);

            log.info("[Scheduler] EXPIRED: memberId={}, sessionId={}", expired.getMemberId(), sessionId);

            // 2. Tìm và promote người kế tiếp (position nhỏ nhất còn WAITING)
            waitingListRepositoryPort.findFirstWaitingBySessionId(sessionId).ifPresent(nextEntry -> {
                nextEntry.setStatus("PENDING_CONFIRM");
                nextEntry.setConfirmDeadline(now.plusMinutes(PROMOTE_CONFIRM_MINUTES));
                waitingListRepositoryPort.save(nextEntry);

                log.info("[Scheduler] Promote người kế tiếp: memberId={}, sessionId={}, deadline={}",
                        nextEntry.getMemberId(), sessionId, nextEntry.getConfirmDeadline());

                // TODO: Gửi notification cho nextEntry.getMemberId() khi có notification module
            });
        }
    }
}
