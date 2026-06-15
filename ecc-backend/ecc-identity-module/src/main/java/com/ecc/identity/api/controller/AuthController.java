package com.ecc.identity.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.identity.api.dto.request.ForgotPasswordRequest;
import com.ecc.identity.api.dto.request.LoginRequest;
import com.ecc.identity.api.dto.request.RefreshTokenRequest;
import com.ecc.identity.api.dto.request.RegisterRequest;
import com.ecc.identity.api.dto.request.ResetPasswordOtpRequest;
import com.ecc.identity.api.dto.request.ResetPasswordTokenRequest;
import com.ecc.identity.api.dto.request.Verify2faLoginRequest;
import com.ecc.identity.api.dto.request.Verify2faSetupRequest;
import com.ecc.identity.api.dto.request.Disable2faRequest;
import com.ecc.identity.api.dto.response.AuthResponse;
import com.ecc.identity.api.dto.response.Setup2faResponse;
import com.ecc.identity.application.port.in.ForgotPasswordUseCase;
import com.ecc.identity.application.port.in.LogoutUseCase;
import com.ecc.identity.application.port.in.RefreshTokenUseCase;

import com.ecc.identity.application.port.in.LoginUseCase;
import com.ecc.identity.application.port.in.RegisterUseCase;
import com.ecc.identity.application.port.in.VerifyEmailUseCase;
import com.ecc.identity.application.port.in.TwoFactorAuthUseCase;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterUseCase registerUseCase;
    private final VerifyEmailUseCase verifyEmailUseCase;
    private final LoginUseCase loginUseCase;
    private final TwoFactorAuthUseCase twoFactorAuthUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final LogoutUseCase logoutUseCase;
    private final ForgotPasswordUseCase forgotPasswordUseCase;

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

    // 1.5 refresh token
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = refreshTokenUseCase.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) RefreshTokenRequest request) { // Tái sử dụng class DTO có sẵn

        String accessToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7);
        }

        String refreshToken = (request != null) ? request.getRefreshToken() : null;

        logoutUseCase.logout(accessToken, refreshToken);

        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công!"));
    }

    // Quên mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        forgotPasswordUseCase.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPasswordWithOtp(@Valid @RequestBody ResetPasswordOtpRequest request) {
        forgotPasswordUseCase.resetPasswordWithOtp(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công!"));
    }

    @GetMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> verifyResetToken(@RequestParam("token") String token) {
        forgotPasswordUseCase.verifyResetToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token hợp lệ, vui lòng nhập mật khẩu mới."));
    }

    @PostMapping("/reset-password-confirm")
    public ResponseEntity<ApiResponse<String>> resetPasswordWithToken(@Valid @RequestBody ResetPasswordTokenRequest request) {
        forgotPasswordUseCase.resetPasswordWithToken(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công!"));
    }

    // API Tắt 2FA
    @PostMapping("/2fa/disable")
    public ResponseEntity<ApiResponse<String>> disable2fa(
            @RequestParam("userId") Long userId,
            @Valid @RequestBody Disable2faRequest request) {
        twoFactorAuthUseCase.disable2fa(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Đã tắt bảo mật 2 lớp thành công."));
    }
}