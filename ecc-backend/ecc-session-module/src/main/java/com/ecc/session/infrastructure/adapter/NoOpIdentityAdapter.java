package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.IdentityPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class NoOpIdentityAdapter implements IdentityPort {
    @Override
    public void lockUser(Long userId, String duration, String reason) {
        // TODO: Replace with actual identity module call in the future
        log.warn("[IDENTITY] Lock userId={}, duration={}, reason={} (NoOp - identity integration pending)", userId, duration, reason);
    }
}
