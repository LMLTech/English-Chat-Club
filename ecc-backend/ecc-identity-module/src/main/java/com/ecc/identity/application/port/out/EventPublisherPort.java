package com.ecc.identity.application.port.out;

import com.ecc.common.event.DomainEvent;

// Outbound Port dùng để publish Domain Event
public interface EventPublisherPort {

    // Phát sinh sự kiện để các module khác xử lý
    void publish(DomainEvent event);
}
