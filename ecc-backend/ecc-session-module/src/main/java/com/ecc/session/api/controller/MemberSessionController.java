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
 * Controller dành cho Member: đặt chỗ, hủy chỗ, xác nhận promote.
 * cefrLevel và status được đọc từ request attribute (đã được JwtAuthenticationFilter set).
 */
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class MemberSessionController {

    private final ManageSessionUseCase manageSessionUseCase;

    /**
     * GET /api/sessions
     * Lấy danh sách các session
     */
    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<com.ecc.session.domain.model.Session>>> getAllSessions() {
        return ResponseEntity.ok(ApiResponse.success(manageSessionUseCase.getAvailableSessions()));
    }

    /**
     * POST /api/sessions/{id}/book
     * Flow 2.3 – Member đặt chỗ. Nếu đầy → vào Waiting List.
     */
    @PostMapping("/{id}/book")
    @PreAuthorize("hasAuthority('MEMBER')")
    public ResponseEntity<ApiResponse<BookingResponse>> bookSession(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest request) {

        Long memberId = Long.parseLong(authentication.getName());
        String memberStatus    = (String) request.getAttribute("memberStatus");
        String memberCefrLevel = (String) request.getAttribute("cefrLevel");

        BookingResponse response = manageSessionUseCase.bookSession(memberId, id, memberStatus, memberCefrLevel);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * DELETE /api/sessions/{id}/book
     * Flow 2.4 – Member hủy chỗ.
     * - Nếu hủy muộn (< 2h trước giờ bắt đầu) → trừ 5 điểm.
     * - Tự động promote người đầu hàng chờ lên PENDING_CONFIRM (10 phút để xác nhận).
     */
    @DeleteMapping("/{id}/book")
    @PreAuthorize("hasAuthority('MEMBER')")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {

        Long memberId = Long.parseLong(authentication.getName());
        BookingResponse response = manageSessionUseCase.cancelBooking(memberId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /api/sessions/{id}/confirm-promote
     * Flow 2.4 – Member được promote xác nhận slot trong vòng 10 phút.
     * Nếu không xác nhận → scheduler sẽ chuyển EXPIRED và promote người kế tiếp.
     */
    @PostMapping("/{id}/confirm-promote")
    @PreAuthorize("hasAuthority('MEMBER')")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmPromotion(
            @PathVariable Long id,
            Authentication authentication) {

        Long memberId = Long.parseLong(authentication.getName());
        BookingResponse response = manageSessionUseCase.confirmPromotion(memberId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
