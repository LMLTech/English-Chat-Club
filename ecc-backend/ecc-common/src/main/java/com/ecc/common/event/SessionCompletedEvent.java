package com.ecc.common.event;

import java.util.Map;

public class SessionCompletedEvent extends DomainEvent {
    private final Long sessionId;
    private final Map<Long, Integer> userSpeakingSeconds;
    private final Map<Long, Integer> userMessageCounts; // THÊM: Lưu số lượng tin nhắn

    public SessionCompletedEvent(Long sessionId, Map<Long, Integer> userSpeakingSeconds, Map<Long, Integer> userMessageCounts) {
        super();
        this.sessionId = sessionId;
        this.userSpeakingSeconds = userSpeakingSeconds;
        this.userMessageCounts = userMessageCounts;
    }

    public Long getSessionId() { return sessionId; }
    public Map<Long, Integer> getUserSpeakingSeconds() { return userSpeakingSeconds; }
    public Map<Long, Integer> getUserMessageCounts() { return userMessageCounts; } // THÊM: Getter
}