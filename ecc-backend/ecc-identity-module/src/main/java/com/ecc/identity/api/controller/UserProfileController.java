package com.ecc.identity.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.identity.api.dto.request.UpdateInterestsRequest;
import com.ecc.identity.api.dto.request.UpdateProfileRequest;
import com.ecc.identity.api.dto.response.UserProfileResponse;
import com.ecc.identity.application.port.in.UserProfileUseCase;
import com.ecc.identity.application.port.in.UserAddressUseCase;
import com.ecc.identity.api.dto.request.AddressRequest;
import com.ecc.identity.api.dto.response.AddressResponse;
import org.springframework.security.core.Authentication;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileUseCase userProfileUseCase;
    private final UserAddressUseCase userAddressUseCase;

    // Helper method để bóc userId từ JWT Token
    private Long getCurrentUserId(Authentication authentication) {
        return Long.parseLong(authentication.getName());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        UserProfileResponse response = userProfileUseCase.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        UserProfileResponse response = userProfileUseCase.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/interests")
    public ResponseEntity<ApiResponse<String>> updateInterests(
            @Valid @RequestBody UpdateInterestsRequest request,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        userProfileUseCase.updateInterests(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật chủ đề quan tâm thành công."));
    }

    // --- FLOW 1.10: CRUD ĐỊA CHỈ NHẬN QUÀ ---
    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @Valid @RequestBody AddressRequest request,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        AddressResponse response = userAddressUseCase.addAddress(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        List<AddressResponse> responses = userAddressUseCase.getUserAddresses(userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        AddressResponse response = userAddressUseCase.updateAddress(userId, addressId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse<String>> deleteAddress(
            @PathVariable Long addressId,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        userAddressUseCase.deleteAddress(userId, addressId);
        return ResponseEntity.ok(ApiResponse.success("Xóa địa chỉ thành công."));
    }
}