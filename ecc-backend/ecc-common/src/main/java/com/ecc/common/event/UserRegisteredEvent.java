package com.ecc.common.event;

public class UserRegisteredEvent extends DomainEvent {
    private final Long userId;
    private final String email;

    public UserRegisteredEvent(Long userId, String email) {
        super();
        this.userId = userId;
        this.email = email;
    }

    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
}