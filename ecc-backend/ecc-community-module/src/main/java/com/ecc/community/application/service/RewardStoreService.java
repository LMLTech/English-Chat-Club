package com.ecc.community.application.service;

import com.ecc.community.application.port.in.RewardStoreUseCase;
import com.ecc.community.application.port.out.MemberPointsPort;
import com.ecc.community.application.port.out.PointTransactionPort;
import com.ecc.community.application.port.out.RedemptionOrderPort;
import com.ecc.community.application.port.out.RewardItemPort;
import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.domain.model.PointTransaction;
import com.ecc.community.domain.model.RedemptionOrder;
import com.ecc.community.domain.model.RewardItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class RewardStoreService implements RewardStoreUseCase {

    private final RewardItemPort rewardItemPort;
    private final RedemptionOrderPort redemptionOrderPort;
    private final MemberPointsPort memberPointsPort;
    private final PointTransactionPort pointTransactionPort;

    @Override
    @Transactional(readOnly = true)
    public Page<RewardItem> getAvailableRewards(Pageable pageable) {
        return rewardItemPort.findActiveItems(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RewardItem> getAllRewards(Pageable pageable) {
        return rewardItemPort.findAll(pageable);
    }

    @Override
    @Transactional
    public RewardItem createRewardItem(RewardItem item) {
        return rewardItemPort.save(item);
    }

    @Override
    @Transactional
    public RewardItem updateRewardItem(Long id, RewardItem item) {
        RewardItem existing = rewardItemPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món quà"));
        existing.setName(item.getName());
        existing.setDescription(item.getDescription());
        existing.setImageUrl(item.getImageUrl());
        existing.setPointsCost(item.getPointsCost());
        existing.setType(item.getType());
        existing.setStockQuantity(item.getStockQuantity());
        existing.setIsActive(item.getIsActive());
        return rewardItemPort.save(existing);
    }

    @Override
    @Transactional
    public void deleteRewardItem(Long id) {
        RewardItem existing = rewardItemPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món quà"));
        existing.setDeletedAt(LocalDateTime.now());
        existing.setIsActive(false);
        rewardItemPort.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RedemptionOrder> getMyOrders(Long userId, Pageable pageable) {
        return redemptionOrderPort.findByUserId(userId, pageable);
    }

    @Override
    @Transactional
    public RedemptionOrder redeemItem(Long userId, Long rewardItemId, Long addressId) {
        try {
            RewardItem item = rewardItemPort.findById(rewardItemId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món quà"));

            if (!item.getIsActive() || item.getDeletedAt() != null) {
                throw new IllegalStateException("Món quà này hiện không khả dụng");
            }

            if (item.getStockQuantity() != null && item.getStockQuantity() <= 0) {
                throw new IllegalStateException("Món quà này đã hết hàng");
            }

            if ("PHYSICAL".equals(item.getType()) && addressId == null) {
                throw new IllegalArgumentException("Đổi quà vật lý bắt buộc phải chọn địa chỉ nhận hàng");
            }

            MemberPoints points = memberPointsPort.findByUserId(userId)
                    .orElseThrow(() -> new IllegalStateException("Chưa có dữ liệu điểm"));

            if (points.getTotalPoints() < item.getPointsCost()) {
                throw new IllegalStateException("Không đủ điểm để đổi món quà này");
            }

            // Trừ điểm
            points.setTotalPoints(points.getTotalPoints() - item.getPointsCost());
            memberPointsPort.save(points);

            // Ghi log giao dịch
            pointTransactionPort.save(PointTransaction.builder()
                    .userId(userId)
                    .points(-item.getPointsCost()) // Đổi thành points cho khớp với Entity của bạn
                    .reason("REDEEM_ITEM")
                    .description("Đổi món quà ID: " + item.getId()) // Đổi thành description
                    // .occurredAt(LocalDateTime.now()) // dòng này nếu Entity của bạn không có @CreationTimestamp
                    .build());

            // Trừ tồn kho
            if (item.getStockQuantity() != null) {
                item.setStockQuantity(item.getStockQuantity() - 1);
                rewardItemPort.save(item);
            }

            // Khởi tạo đơn hàng
            String initialStatus = "VIRTUAL".equals(item.getType()) ? "DELIVERED" : "PROCESSING";

            RedemptionOrder order = RedemptionOrder.builder()
                    .userId(userId)
                    .rewardItem(item)
                    .addressId("PHYSICAL".equals(item.getType()) ? addressId : null)
                    .pointsDeducted(item.getPointsCost())
                    .status(initialStatus)
                    .orderedAt(LocalDateTime.now())
                    .build();

            if ("DELIVERED".equals(initialStatus)) {
                order.setDeliveredAt(LocalDateTime.now());
            }

            RedemptionOrder savedOrder = redemptionOrderPort.save(order);
            log.info("[RewardStore] ✅ userId={} đổi thành công món quà '{}'", userId, item.getName());

            return savedOrder;

        } catch (ObjectOptimisticLockingFailureException e) {
            log.error("[RewardStore] Conflict dữ liệu (Optimistic Lock) khi userId={} đổi quà {}", userId, rewardItemId);
            throw new IllegalStateException("Món quà đang được rất nhiều người săn đón, vui lòng thử lại!");
        }
    }
    @Override
    @Transactional
    public RedemptionOrder updateOrderStatus(Long orderId, String newStatus, String trackingCode) {
        RedemptionOrder order = redemptionOrderPort.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng"));

        order.setStatus(newStatus);

        if ("SHIPPED".equals(newStatus)) {
            order.setShippedAt(LocalDateTime.now());
            if (trackingCode != null) {
                order.setTrackingCode(trackingCode);
            }
        } else if ("DELIVERED".equals(newStatus)) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        log.info("[RewardStore] Admin đã cập nhật đơn hàng {} thành {}", orderId, newStatus);
        return redemptionOrderPort.save(order);
    }
}