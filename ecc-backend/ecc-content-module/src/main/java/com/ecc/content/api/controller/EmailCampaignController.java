package com.ecc.content.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.content.api.dto.request.EmailCampaignRequest;
import com.ecc.content.application.port.in.EmailCampaignUseCase;
import com.ecc.content.domain.model.EmailCampaign;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/content/campaigns")
@RequiredArgsConstructor
public class EmailCampaignController {

    private final EmailCampaignUseCase campaignUseCase;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<EmailCampaign>>> getCampaigns() {
        return ResponseEntity.ok(ApiResponse.success(campaignUseCase.getAllCampaigns()));
    }

    // 1. Tạo chiến dịch (Lưu nháp)
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<EmailCampaign>> createCampaign(
            Authentication authentication,
            @Valid @RequestBody EmailCampaignRequest request) {

        Long adminId = Long.parseLong(authentication.getName());
        EmailCampaign campaign = campaignUseCase.createCampaign(adminId, request);
        return ResponseEntity.ok(ApiResponse.success(campaign));
    }

    // 2. Kích hoạt gửi ngay lập tức
    @PostMapping("/{id}/send-now")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> sendCampaignNow(@PathVariable Long id) {
        campaignUseCase.sendCampaignNow(id);
        return ResponseEntity.ok(ApiResponse.success("Hệ thống đang tiến hành gửi email ngầm (Background Task). Bạn có thể kiểm tra DB Log sau ít phút."));
    }
}