package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b WHERE b.memberId = :memberId AND b.session.id = :sessionId AND b.status = 'CONFIRMED'")
    Optional<Booking> findActiveByMemberIdAndSessionId(
            @Param("memberId") Long memberId,
            @Param("sessionId") Long sessionId
    );

    @Query("SELECT b.session.id FROM Booking b WHERE b.memberId = :memberId AND b.status IN ('CONFIRMED', 'WAITING')")
    java.util.List<Long> findBookedSessionIdsByMemberId(@Param("memberId") Long memberId);
}
