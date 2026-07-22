package com.ecc.community.application.port.in;

import com.ecc.community.domain.model.RedemptionOrder;
import com.ecc.community.domain.model.RewardItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RewardStoreUseCase {
    Page<RewardItem> getAvailableRewards(Pageable pageable);
    Page<RewardItem> getAllRewards(Pageable pageable);
    RewardItem createRewardItem(RewardItem item);
    RewardItem updateRewardItem(Long id, RewardItem item);
    void deleteRewardItem(Long id);
    Page<RedemptionOrder> getMyOrders(Long userId, Pageable pageable);
    RedemptionOrder redeemItem(Long userId, Long rewardItemId, Long addressId);
    RedemptionOrder updateOrderStatus(Long orderId, String newStatus, String trackingCode);
}