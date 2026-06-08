package com.ecc.common.event;

public class VocabularyPraisedEvent extends DomainEvent {
    private final Long sessionId;
    private final Long highlightedByUserId;
    private final Long praisedUserId;
    private final String word;

    public VocabularyPraisedEvent(Long sessionId, Long highlightedByUserId, Long praisedUserId, String word) {
        super();
        this.sessionId = sessionId;
        this.highlightedByUserId = highlightedByUserId;
        this.praisedUserId = praisedUserId;
        this.word = word;
    }


}