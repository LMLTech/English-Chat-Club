package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.WaitingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface WaitingListRepository extends JpaRepository<WaitingList, Long> {

    boolean existsByMemberIdAndSessionId(Long memberId, Long sessionId);

    @Query("SELECT COALESCE(MAX(w.position), 0) FROM WaitingList w WHERE w.session.id = :sessionId AND w.status = 'WAITING'")
    int findMaxPositionBySessionId(@Param("sessionId") Long sessionId);
}
