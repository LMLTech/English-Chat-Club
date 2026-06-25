package com.ecc.common.event;

public class LevelUpEvent extends DomainEvent {
    private final Long userId;
    private final Integer newLevel;

    public LevelUpEvent(Long userId, Integer newLevel) {
        super();
        this.userId = userId;
        this.newLevel = newLevel;
    }

    public Long getUserId() { return userId; }
    public Integer getNewLevel() { return newLevel; }
}