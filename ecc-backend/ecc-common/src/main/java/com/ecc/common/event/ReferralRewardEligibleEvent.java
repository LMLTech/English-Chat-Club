package com.ecc.common.event;

public class ReferralRewardEligibleEvent extends DomainEvent {
    private final Long referrerId;
    private final Long referredUserId;

    public ReferralRewardEligibleEvent(Long referrerId, Long referredUserId) {
        super();
        this.referrerId = referrerId;
        this.referredUserId = referredUserId;
    }

    public Long getReferrerId() { return referrerId; }
    public Long getReferredUserId() { return referredUserId; }
}