package com.ecc.common.event;

import java.util.Map;

public class SessionCompletedEvent extends DomainEvent {
    private final Long sessionId;
    private final Map<Long, Integer> userSpeakingSeconds;

    public SessionCompletedEvent(Long sessionId, Map<Long, Integer> userSpeakingSeconds) {
        super();
        this.sessionId = sessionId;
        this.userSpeakingSeconds = userSpeakingSeconds;
    }

    public Long getSessionId() { return sessionId; }
    public Map<Long, Integer> getUserSpeakingSeconds() { return userSpeakingSeconds; }
}