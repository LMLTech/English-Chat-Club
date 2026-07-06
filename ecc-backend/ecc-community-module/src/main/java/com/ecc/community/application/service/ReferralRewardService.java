package com.ecc.community.application.service;

import com.ecc.community.application.port.in.ReferralRewardUseCase;
import com.ecc.community.application.port.out.MemberPointsPort;
import com.ecc.community.application.port.out.PointTransactionPort;
import com.ecc.community.application.port.out.ReferralHistoryPort;
import com.ecc.community.application.port.out.UserStatisticsPort;
import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.domain.model.PointTransaction;
import com.ecc.community.domain.model.ReferralHistory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReferralRewardService implements ReferralRewardUseCase {

    private final ReferralHistoryPort referralHistoryPort;
    private final UserStatisticsPort userStatisticsPort;
    private final MemberPointsPort memberPointsPort;
    private final PointTransactionPort pointTransactionPort;

    private static final int REQUIRED_SESSIONS = 3;
    private static final int REWARD_POINTS = 50;

    @Override
    @Transactional
    public boolean checkAndProcessReferralReward(Long referredUserId) {
        // 1. Kiểm tra xem user này có người giới thiệu không (và chưa được nhận thưởng)
        Optional<ReferralHistory> pendingReferral = referralHistoryPort.findPendingReferralByReferredUserId(referredUserId);

        if (pendingReferral.isEmpty()) {
            return false; // Không có người giới thiệu hoặc đã nhận thưởng rồi
        }

        ReferralHistory referral = pendingReferral.get();

        // 2. Đếm tổng số buổi đã tham gia
        int attendedCount = userStatisticsPort.countTotalAttendedSessions(referredUserId);

        if (attendedCount < REQUIRED_SESSIONS) {
            log.info("[Referral] User {} mới học {}/{} buổi, chưa đủ điều kiện thưởng.", referredUserId, attendedCount, REQUIRED_SESSIONS);
            return false;
        }

        // 3. Đã đủ điều kiện -> Cộng 50 điểm cho CẢ HAI
        log.info("[Referral] User {} đã đạt {} buổi! Tiến hành thưởng mã giới thiệu.", referredUserId, REQUIRED_SESSIONS);

        // Cộng điểm cho người được giới thiệu (Newbie)
        addPointsToUser(referral.getReferredUserId(), REWARD_POINTS, "Thưởng hoàn thành 3 buổi học đầu tiên");

        // Cộng điểm cho người đi giới thiệu (Referrer)
        addPointsToUser(referral.getReferrerId(), REWARD_POINTS, "Thưởng giới thiệu bạn bè thành công");

        // 4. Cập nhật trạng thái ReferralHistory
        referral.setStatus("REWARDED");
        referral.setPointsAwarded(REWARD_POINTS * 2); // Tổng điểm hệ thống xuất ra
        referralHistoryPort.save(referral);

        return true;
    }

    private void addPointsToUser(Long userId, int points, String description) {
        MemberPoints memberPoints = memberPointsPort.findByUserId(userId)
                .orElse(MemberPoints.builder().userId(userId).totalPoints(0).currentLevel(1).build());

        memberPoints.setTotalPoints(memberPoints.getTotalPoints() + points);
        memberPointsPort.save(memberPoints);

        pointTransactionPort.save(PointTransaction.builder()
                .userId(userId)
                .points(points)
                .reason("REFERRAL_REWARD")
                .description(description)
                .build());
    }
}