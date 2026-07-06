package com.ecc.community.application.port.in;

public interface ReferralRewardUseCase {
    // Kiểm tra xem User này đã đủ điều kiện để cả 2 cùng nhận thưởng chưa
    boolean checkAndProcessReferralReward(Long referredUserId);
}