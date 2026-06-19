package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.Booking;

import java.util.Optional;

public interface BookingRepositoryPort {

    /** Lưu hoặc cập nhật booking */
    Booking save(Booking booking);

    /** Kiểm tra user đã có booking CONFIRMED trong session này chưa */
    Optional<Booking> findActiveByMemberIdAndSessionId(Long memberId, Long sessionId);
}
