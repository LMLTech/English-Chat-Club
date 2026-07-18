package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.Booking;

import java.util.Optional;

public interface BookingRepositoryPort {

    /** Lưu hoặc cập nhật booking */
    Booking save(Booking booking);

    /** Tìm booking theo internal ID */
    Optional<Booking> findById(Long bookingId);

    /** Tìm booking CONFIRMED của một member trong một session */
    Optional<Booking> findActiveByMemberIdAndSessionId(Long memberId, Long sessionId);

    /** Tìm booking (bất kể trạng thái) của một member trong một session */
    Optional<Booking> findByMemberIdAndSessionId(Long memberId, Long sessionId);

    /** Lấy danh sách ID các session mà member đã đặt chỗ (bao gồm CONFIRMED và WAITING) */
    java.util.List<Long> findBookedSessionIdsByMemberId(Long memberId);
}
