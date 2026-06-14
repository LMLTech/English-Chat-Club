package com.ecc.identity.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.identity.api.dto.response.AuthResponse;
import com.ecc.identity.api.dto.response.Setup2faResponse;
import com.ecc.identity.api.dto.request.LoginRequest;
import com.ecc.identity.api.dto.request.RegisterRequest;
import com.ecc.identity.api.dto.request.Verify2faLoginRequest;
import com.ecc.identity.api.dto.request.Verify2faSetupRequest;

import com.ecc.identity.application.port.in.LoginUseCase;
import com.ecc.identity.application.port.in.RegisterUseCase;
import com.ecc.identity.application.port.in.VerifyEmailUseCase;
import com.ecc.identity.application.port.in.TwoFactorAuthUseCase;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterUseCase registerUseCase;
    private final VerifyEmailUseCase verifyEmailUseCase;
    private final LoginUseCase loginUseCase;
    private final TwoFactorAuthUseCase twoFactorAuthUseCase;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        registerUseCase.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful. Please check your email to verify."));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam("token") String token) {
        verifyEmailUseCase.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Email verification successful. Your account is now ACTIVE."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        AuthResponse response = loginUseCase.login(request, ipAddress);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // --- CÁC API 2FA (FLOW 1.4) ---
    @PostMapping("/2fa/setup")
    public ResponseEntity<ApiResponse<Setup2faResponse>> initiate2faSetup(@RequestParam("userId") Long userId) {
        Setup2faResponse response = twoFactorAuthUseCase.initiateSetup(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<ApiResponse<String>> finalize2faSetup(
            @RequestParam("userId") Long userId,
            @Valid @RequestBody Verify2faSetupRequest request) {
        twoFactorAuthUseCase.finalizeSetup(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Bật bảo mật 2 lớp thành công!"));
    }

    @PostMapping("/2fa/verify-login")
    public ResponseEntity<ApiResponse<AuthResponse>> verify2faLogin(@Valid @RequestBody Verify2faLoginRequest request) {
        AuthResponse response = twoFactorAuthUseCase.verifyLogin(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}