package com.ecc.session.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.session.api.dto.response.BookingResponse;
import com.ecc.session.application.port.in.ManageSessionUseCase;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller dành cho Member: đặt chỗ session.
 * cefrLevel và status được đọc từ request attribute (đã được JwtAuthenticationFilter set).
 * Không cần import JJWT vào session-module, giữ đúng module boundary.
 */
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class MemberSessionController {

    private final ManageSessionUseCase manageSessionUseCase;

    /**
     * POST /api/sessions/{id}/book
     * Member đặt chỗ vào một phòng hội thoại.
     * Attributes "memberStatus" và "cefrLevel" được inject bởi JwtAuthenticationFilter.
     */
    @PostMapping("/{id}/book")
    @PreAuthorize("hasAuthority('MEMBER')")
    public ResponseEntity<ApiResponse<BookingResponse>> bookSession(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest request) {

        Long memberId = Long.parseLong(authentication.getName());

        // Đọc claims từ request attribute – không parse JWT lại, không cần JJWT dependency
        String memberStatus    = (String) request.getAttribute("memberStatus");
        String memberCefrLevel = (String) request.getAttribute("cefrLevel");

        BookingResponse response = manageSessionUseCase.bookSession(memberId, id, memberStatus, memberCefrLevel);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
