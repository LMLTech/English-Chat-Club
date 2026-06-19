package com.ecc.common.event;

public class LateBookingCancelEvent extends DomainEvent {
    private final Long memberId;
    private final Long sessionId;
    private final int pointsDeducted;

    public LateBookingCancelEvent(Long memberId, Long sessionId, int pointsDeducted) {
        super();
        this.memberId = memberId;
        this.sessionId = sessionId;
        this.pointsDeducted = pointsDeducted;
    }

    public Long getMemberId() { return memberId; }
    public Long getSessionId() { return sessionId; }
    public int getPointsDeducted() { return pointsDeducted; }
}
