package com.ecc.common.event;

public class DirectMessageSentEvent extends DomainEvent {
    private final Long messageId;
    private final Long senderId;
    private final Long receiverId;
    private final String preview;

    public DirectMessageSentEvent(Long messageId, Long senderId, Long receiverId, String preview) {
        super();
        this.messageId = messageId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.preview = preview;
    }

    public Long getMessageId() { return messageId; }
    public Long getSenderId() { return senderId; }
    public Long getReceiverId() { return receiverId; }
    public String getPreview() { return preview; }
}