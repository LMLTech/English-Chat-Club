package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.RedemptionOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface RedemptionOrderPort {
    Optional<RedemptionOrder> findById(Long id);
    Page<RedemptionOrder> findByUserId(Long userId, Pageable pageable);
    Page<RedemptionOrder> findAllOrders(Pageable pageable);
    RedemptionOrder save(RedemptionOrder order);
}