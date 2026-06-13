package com.ecc.identity.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.identity.api.dto.AuthResponse;
import com.ecc.identity.api.dto.LoginRequest;
import com.ecc.identity.api.dto.RegisterRequest;
import com.ecc.identity.application.port.in.LoginUseCase;
import com.ecc.identity.application.port.in.RegisterUseCase;
import com.ecc.identity.application.port.in.VerifyEmailUseCase;
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
}