package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.RedemptionOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RedemptionOrderRepository extends JpaRepository<RedemptionOrder, Long> {

    // EntityGraph để chống N+1 khi lấy Đơn hàng kèm Món quà
    @EntityGraph(attributePaths = {"rewardItem"})
    Page<RedemptionOrder> findByUserIdOrderByOrderedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"rewardItem"})
    Page<RedemptionOrder> findAll(Pageable pageable);
}