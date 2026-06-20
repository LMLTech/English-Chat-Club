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

    public Long getBookingId() { return bookingId; }
    public Long getSessionId() { return sessionId; }
    public Long getMemberId() { return memberId; }
}