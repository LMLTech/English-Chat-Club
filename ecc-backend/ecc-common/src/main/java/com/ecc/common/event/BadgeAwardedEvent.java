package com.ecc.common.event;

public class BadgeAwardedEvent extends DomainEvent {
    private final Long userId;
    private final Long badgeId;

    public BadgeAwardedEvent(Long userId, Long badgeId) {
        super();
        this.userId = userId;
        this.badgeId = badgeId;
    }

    // Getters...
}