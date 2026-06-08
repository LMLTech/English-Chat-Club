package com.ecc.common.event;

public class BookingConfirmedEvent extends DomainEvent {
    private final Long bookingId;
    private final Long sessionId;
    private final Long memberId;

    public BookingConfirmedEvent(Long bookingId, Long sessionId, Long memberId) {
        super();
        this.bookingId = bookingId;
        this.sessionId = sessionId;
        this.memberId = memberId;
    }

    // Getters...
}