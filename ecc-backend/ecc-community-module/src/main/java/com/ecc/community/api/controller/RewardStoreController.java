package com.ecc.community.api.controller;

import com.ecc.common.audit.Auditable;
import com.ecc.common.dto.ApiResponse;
import com.ecc.community.api.dto.request.RedeemRequest;
import com.ecc.community.api.dto.response.RedemptionOrderResponse;
import com.ecc.community.api.dto.response.RewardItemResponse;
import com.ecc.community.application.port.in.RewardStoreUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.ecc.community.api.dto.request.RewardItemRequest;
import com.ecc.community.domain.model.RewardItem;

@RestController
@RequestMapping("/api/community/rewards")
@RequiredArgsConstructor
public class RewardStoreController {

    private final RewardStoreUseCase rewardStoreUseCase; // Dùng Port In

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RewardItemResponse>>> getAvailableRewards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Page<RewardItemResponse> items = rewardStoreUseCase.getAvailableRewards(PageRequest.of(page, size))
                .map(item -> RewardItemResponse.builder()
                        .id(item.getId())
                        .name(item.getName())
                        .description(item.getDescription())
                        .imageUrl(item.getImageUrl())
                        .pointsCost(item.getPointsCost())
                        .type(item.getType())
                        .stockQuantity(item.getStockQuantity())
                        .isAvailable(item.getIsActive() && (item.getStockQuantity() == null || item.getStockQuantity() > 0))
                        .build());

        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<RewardItemResponse>>> getAllRewards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<RewardItemResponse> items = rewardStoreUseCase.getAllRewards(PageRequest.of(page, size))
                .map(item -> RewardItemResponse.builder()
                        .id(item.getId())
                        .name(item.getName())
                        .description(item.getDescription())
                        .imageUrl(item.getImageUrl())
                        .pointsCost(item.getPointsCost())
                        .type(item.getType())
                        .stockQuantity(item.getStockQuantity())
                        .isAvailable(item.getIsActive() && (item.getStockQuantity() == null || item.getStockQuantity() > 0))
                        .build());

        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Auditable(action = "CREATE_REWARD", description = "Tạo phần thưởng mới")
    public ResponseEntity<ApiResponse<RewardItemResponse>> createReward(@Valid @RequestBody RewardItemRequest request) {
        RewardItem item = RewardItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .pointsCost(request.getPointsCost())
                .type(request.getType())
                .stockQuantity(request.getStockQuantity())
                .isActive(request.getIsActive())
                .build();
        
        RewardItem saved = rewardStoreUseCase.createRewardItem(item);
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(saved)));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Auditable(action = "UPDATE_REWARD", description = "Cập nhật phần thưởng")
    public ResponseEntity<ApiResponse<RewardItemResponse>> updateReward(
            @PathVariable Long id,
            @Valid @RequestBody RewardItemRequest request) {
        RewardItem item = RewardItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .pointsCost(request.getPointsCost())
                .type(request.getType())
                .stockQuantity(request.getStockQuantity())
                .isActive(request.getIsActive())
                .build();
        
        RewardItem updated = rewardStoreUseCase.updateRewardItem(id, item);
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(updated)));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Auditable(action = "DELETE_REWARD", description = "Xóa phần thưởng")
    public ResponseEntity<ApiResponse<String>> deleteReward(@PathVariable Long id) {
        rewardStoreUseCase.deleteRewardItem(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phần thưởng thành công"));
    }

    private RewardItemResponse mapToResponse(RewardItem item) {
        return RewardItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .imageUrl(item.getImageUrl())
                .pointsCost(item.getPointsCost())
                .type(item.getType())
                .stockQuantity(item.getStockQuantity())
                .isAvailable(item.getIsActive() && (item.getStockQuantity() == null || item.getStockQuantity() > 0))
                .build();
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('MODERATOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<RedemptionOrderResponse>>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long userId = Long.parseLong(authentication.getName());
        Page<RedemptionOrderResponse> orders = rewardStoreUseCase.getMyOrders(userId, PageRequest.of(page, size))
                .map(order -> RedemptionOrderResponse.builder()
                        .orderId(order.getUuid())
                        .itemName(order.getRewardItem().getName())
                        .pointsDeducted(order.getPointsDeducted())
                        .status(order.getStatus())
                        .trackingCode(order.getTrackingCode())
                        .orderedAt(order.getOrderedAt())
                        .shippedAt(order.getShippedAt())
                        .deliveredAt(order.getDeliveredAt())
                        .build());

        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PostMapping("/redeem")
    @PreAuthorize("hasAuthority('MEMBER') or hasAuthority('MODERATOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> redeemItem(
            Authentication authentication,
            @Valid @RequestBody RedeemRequest request) {

        Long userId = Long.parseLong(authentication.getName());
        var order = rewardStoreUseCase.redeemItem(userId, request.getRewardItemId(), request.getAddressId());

        return ResponseEntity.ok(ApiResponse.success(
                "Đổi quà thành công! Mã đơn hàng: " + order.getUuid()));
    }

    @PutMapping("/admin/orders/{orderId}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Auditable(action = "UPDATE_ORDER_STATUS", description = "Cập nhật trạng thái đơn đổi quà")
    public ResponseEntity<ApiResponse<RedemptionOrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status,
            @RequestParam(required = false) String trackingCode) {

        var order = rewardStoreUseCase.updateOrderStatus(orderId, status, trackingCode);

        var response = RedemptionOrderResponse.builder()
                .orderId(order.getUuid())
                .itemName(order.getRewardItem().getName())
                .pointsDeducted(order.getPointsDeducted())
                .status(order.getStatus())
                .trackingCode(order.getTrackingCode())
                .orderedAt(order.getOrderedAt())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}