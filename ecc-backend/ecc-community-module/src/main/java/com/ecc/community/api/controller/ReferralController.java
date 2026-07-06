package com.ecc.community.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.community.application.port.in.ReferralRewardUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/community/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralRewardUseCase referralRewardUseCase;

    // API dành cho Member tự ấn kiểm tra (hoặc hệ thống gọi)
    @PostMapping("/check-reward")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> checkReferralReward(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());

        boolean rewarded = referralRewardUseCase.checkAndProcessReferralReward(userId);

        if (rewarded) {
            return ResponseEntity.ok(ApiResponse.success("Chúc mừng! Cả bạn và người giới thiệu đều đã được cộng 50 điểm."));
        } else {
            return ResponseEntity.ok(ApiResponse.success("Chưa đủ điều kiện nhận thưởng hoặc đã nhận rồi. Cần học đủ 3 buổi."));
        }
    }
}