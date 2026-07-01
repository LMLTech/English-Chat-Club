package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.RewardItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RewardItemRepository extends JpaRepository<RewardItem, Long> {
    Page<RewardItem> findByIsActiveTrueAndDeletedAtIsNull(Pageable pageable);
}