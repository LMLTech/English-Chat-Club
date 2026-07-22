package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.RewardItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface RewardItemPort {
    Optional<RewardItem> findById(Long id);
    Page<RewardItem> findActiveItems(Pageable pageable);
    Page<RewardItem> findAll(Pageable pageable);
    RewardItem save(RewardItem rewardItem);
    void deleteById(Long id);
}