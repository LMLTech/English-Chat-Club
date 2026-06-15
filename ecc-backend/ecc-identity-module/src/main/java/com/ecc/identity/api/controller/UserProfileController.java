package com.ecc.identity.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.identity.api.dto.request.UpdateInterestsRequest;
import com.ecc.identity.api.dto.request.UpdateProfileRequest;
import com.ecc.identity.api.dto.response.UserProfileResponse;
import com.ecc.identity.application.port.in.UserProfileUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileUseCase userProfileUseCase;

    // TODO: Khi hoàn thành Flow 1.14, sẽ lấy userId từ SecurityContextHolder thay vì @RequestParam

    @GetMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(@RequestParam("userId") Long userId) {
        UserProfileResponse response = userProfileUseCase.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @RequestParam("userId") Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse response = userProfileUseCase.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/interests")
    public ResponseEntity<ApiResponse<String>> updateInterests(
            @RequestParam("userId") Long userId,
            @Valid @RequestBody UpdateInterestsRequest request) {
        userProfileUseCase.updateInterests(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật chủ đề quan tâm thành công."));
    }
}