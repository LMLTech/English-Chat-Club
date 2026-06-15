package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.CalendarIntegrationRepositoryPort;
import com.ecc.identity.domain.model.UserCalendarIntegration;
import com.ecc.identity.infrastructure.repository.UserCalendarIntegrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CalendarIntegrationRepositoryAdapter implements CalendarIntegrationRepositoryPort {

    private final UserCalendarIntegrationRepository repository;

    @Override
    public UserCalendarIntegration save(UserCalendarIntegration integration) {
        return repository.save(integration);
    }

    @Override
    public Optional<UserCalendarIntegration> findByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public void deleteByUserId(Long userId) {
        repository.deleteByUserId(userId);
    }
}