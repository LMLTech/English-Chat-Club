package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.PointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    List<PointTransaction> findByUserIdOrderByOccurredAtDesc(Long userId);
}
