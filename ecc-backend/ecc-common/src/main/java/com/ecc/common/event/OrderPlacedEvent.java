package com.ecc.common.event;

public class OrderPlacedEvent extends DomainEvent {
    private final Long orderId;
    private final Long userId;

    public OrderPlacedEvent(Long orderId, Long userId) {
        super();
        this.orderId = orderId;
        this.userId = userId;
    }

    // Getters...
}