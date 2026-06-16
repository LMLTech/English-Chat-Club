package com.ecc.identity.application.port.out;

import com.ecc.identity.domain.model.UserCalendarIntegration;
import java.util.Optional;

public interface CalendarIntegrationRepositoryPort {
    UserCalendarIntegration save(UserCalendarIntegration integration);
    Optional<UserCalendarIntegration> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}