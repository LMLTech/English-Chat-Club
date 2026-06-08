package com.ecc.common.event;

public class DirectMessageSentEvent extends DomainEvent {
    private final Long messageId;
    private final Long senderId;
    private final Long receiverId;

    public DirectMessageSentEvent(Long messageId, Long senderId, Long receiverId) {
        super();
        this.messageId = messageId;
        this.senderId = senderId;
        this.receiverId = receiverId;
    }

    // Getters...
}