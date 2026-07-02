package com.ecc.community.application.service;

import com.ecc.community.api.dto.request.ChallengeCreateRequest;
import com.ecc.community.application.port.in.ChallengeUseCase;
import com.ecc.community.application.port.out.ChallengeParticipantPort;
import com.ecc.community.application.port.out.ChallengePort;
import com.ecc.community.application.port.out.MemberPointsPort;
import com.ecc.community.application.port.out.PointTransactionPort;
import com.ecc.community.application.port.out.UserStatisticsPort; // Đã thêm import này
import com.ecc.community.domain.model.Challenge;
import com.ecc.community.domain.model.ChallengeParticipant;
import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.domain.model.PointTransaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeService implements ChallengeUseCase {

    private final ChallengePort challengePort;
    private final ChallengeParticipantPort participantPort;
    private final MemberPointsPort memberPointsPort;
    private final PointTransactionPort pointTransactionPort;
    private final UserStatisticsPort userStatisticsPort; // Port truy xuất DB thật
    // Bổ sung UserBadgePort nếu bạn muốn lưu huy hiệu vào bảng user_badges

    @Override
    @Transactional
    public Challenge createChallenge(Long adminId, ChallengeCreateRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Ngày kết thúc không được trước ngày bắt đầu");
        }

        Challenge challenge = Challenge.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .conditionExpression(request.getConditionExpression())
                .rewardPoints(request.getRewardPoints())
                .rewardBadgeId(request.getRewardBadgeId())
                .createdBy(adminId)
                .build();

        return challengePort.save(challenge);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Challenge> getActiveChallenges(Pageable pageable) {
        return challengePort.findActiveChallenges(LocalDate.now(), pageable);
    }

    @Override
    @Transactional
    public ChallengeParticipant joinChallenge(Long userId, Long challengeId) {
        Challenge challenge = challengePort.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thử thách"));

        if (!challenge.isActive()) {
            throw new IllegalStateException("Thử thách này không trong thời gian hoạt động");
        }

        if (participantPort.existsByChallengeIdAndUserId(challengeId, userId)) {
            throw new IllegalStateException("Bạn đã tham gia thử thách này rồi");
        }

        ChallengeParticipant participant = ChallengeParticipant.builder()
                .challenge(challenge)
                .userId(userId)
                .status("JOINED")
                .progress("{\"current_value\": 0}") // Mặc định tiến độ = 0
                .build();

        log.info("[Challenge] User {} vừa tham gia thử thách {}", userId, challengeId);
        return participantPort.save(participant);
    }

    @Override
    @Transactional
    public void evaluateOngoingChallenges() {
        log.info("[Challenge Evaluator] Đang quét các thử thách...");

        // Lấy tất cả những ai đang tham gia (JOINED)
        List<ChallengeParticipant> ongoingParticipants = participantPort.findByStatus("JOINED");
        LocalDate today = LocalDate.now();

        for (ChallengeParticipant cp : ongoingParticipants) {
            Challenge challenge = cp.getChallenge();

            // Nếu thử thách đã hết hạn mà chưa hoàn thành -> Đánh dấu FAILED
            if (today.isAfter(challenge.getEndDate())) {
                cp.setStatus("FAILED");
                continue;
            }

            // Gọi logic THẬT: Truyền nguyên object challenge vào thay vì chuỗi
            boolean isCompleted = evaluateCondition(cp.getUserId(), challenge);

            if (isCompleted) {
                cp.setStatus("COMPLETED");
                cp.setCompletedAt(LocalDateTime.now());
                cp.setProgress("{\"current_value\": \"MAX\", \"note\": \"Hoàn thành!\"}");

                // Cộng điểm thưởng
                if (challenge.getRewardPoints() > 0) {
                    MemberPoints points = memberPointsPort.findByUserId(cp.getUserId())
                            .orElse(MemberPoints.builder().userId(cp.getUserId()).totalPoints(0).currentLevel(1).build());

                    points.setTotalPoints(points.getTotalPoints() + challenge.getRewardPoints());
                    memberPointsPort.save(points);

                    pointTransactionPort.save(PointTransaction.builder()
                            .userId(cp.getUserId())
                            .points(challenge.getRewardPoints())
                            .reason("CHALLENGE_REWARD")
                            .description("Hoàn thành thử thách: " + challenge.getTitle())
                            .build());
                }

                log.info("[Challenge Evaluator] User {} ĐÃ HOÀN THÀNH thử thách {}, nhận {} điểm",
                        cp.getUserId(), challenge.getId(), challenge.getRewardPoints());
            }
        }

        participantPort.saveAll(ongoingParticipants);
    }

    // Hàm phụ trợ phân tích điều kiện (Hàng Thật Gọi DB)
    private boolean evaluateCondition(Long userId, Challenge challenge) {
        // Xóa khoảng trắng để dễ xử lý. Vd: "sessions_attended >= 5" -> "sessions_attended>=5"
        String expr = challenge.getConditionExpression().replaceAll("\\s+", "");

        try {
            // Phân tích điều kiện: Số buổi học
            if (expr.startsWith("sessions_attended>=")) {
                int requiredTarget = Integer.parseInt(expr.replace("sessions_attended>=", ""));

                // Gọi sang Session Module để đếm data thật
                int actualCount = userStatisticsPort.countAttendedSessions(
                        userId, challenge.getStartDate(), challenge.getEndDate());

                log.info("Check thử thách {}: User {} đạt {}/{} buổi", challenge.getId(), userId, actualCount, requiredTarget);

                return actualCount >= requiredTarget;
            }

            // Nếu sau này hệ thống mở rộng, thêm các else if ở đây (vd: time_spoken>=1800)

        } catch (Exception e) {
            log.error("Lỗi khi parse điều kiện thử thách: {}", expr, e);
        }

        return false;
    }
}