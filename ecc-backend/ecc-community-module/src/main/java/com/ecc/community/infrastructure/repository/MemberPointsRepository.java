package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.MemberPoints;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface MemberPointsRepository extends JpaRepository<MemberPoints, Long> {
    Optional<MemberPoints> findByUserId(Long userId);
    
    @Query("SELECT m FROM MemberPoints m ORDER BY m.totalPoints DESC")
    List<MemberPoints> findTopMembersByPointsDesc(Pageable pageable);
}
