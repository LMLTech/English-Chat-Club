package com.ecc.identity.application.listener;

import com.ecc.common.event.LevelUpEvent;
import com.ecc.identity.application.port.out.UserRepositoryPort;
import com.ecc.identity.domain.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class LevelUpEventListener {

    private final UserRepositoryPort userRepositoryPort;

    @Async
    @EventListener
    @Transactional
    public void handleLevelUpEvent(LevelUpEvent event) {
        log.info("[Identity Module] Received LevelUpEvent for user {}. New Gamification Level: {}", event.getUserId(), event.getNewLevel());
        userRepositoryPort.findById(event.getUserId()).ifPresent(user -> {
            String newCefrLevel = mapLevelToCefr(event.getNewLevel());
            if (newCefrLevel != null && !newCefrLevel.equals(user.getCefrLevel())) {
                user.setCefrLevel(newCefrLevel);
                userRepositoryPort.save(user);
                log.info("[Identity Module] Updated user {} CEFR Level to {}", user.getId(), newCefrLevel);
            }
        });
    }

    private String mapLevelToCefr(Integer gamificationLevel) {
        if (gamificationLevel == null) return null;
        switch (gamificationLevel) {
            case 1: return "A1";
            case 2: return "A2";
            case 3: return "B1";
            case 4: return "B2";
            case 5: return "C1";
            case 6: return "C2";
            default: return gamificationLevel > 6 ? "C2" : "A1";
        }
    }
}
