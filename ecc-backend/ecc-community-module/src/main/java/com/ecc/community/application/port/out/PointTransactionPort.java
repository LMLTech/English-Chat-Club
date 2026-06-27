package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.PointTransaction;
import java.util.List;

public interface PointTransactionPort {
    List<PointTransaction> findByUserIdOrderByOccurredAtDesc(Long userId);
    PointTransaction save(PointTransaction transaction);
}