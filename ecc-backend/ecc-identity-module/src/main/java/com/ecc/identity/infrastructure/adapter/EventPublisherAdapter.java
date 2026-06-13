package com.ecc.identity.infrastructure.adapter;

import com.ecc.common.event.DomainEvent;
import com.ecc.identity.application.port.out.EventPublisherPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component // Adapter triển khai EventPublisherPort
@RequiredArgsConstructor // Tự động inject dependency qua constructor
@Slf4j // Hỗ trợ ghi log
public class EventPublisherAdapter implements EventPublisherPort {

    // Spring Event Publisher
    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publish(DomainEvent event) {

        // Ghi log khi phát sinh sự kiện
        log.info("📢 PUBLISHING EVENT: [{}]", event.getClass().getSimpleName());

        // Publish event tới các listener trong hệ thống
        applicationEventPublisher.publishEvent(event);
    }
}