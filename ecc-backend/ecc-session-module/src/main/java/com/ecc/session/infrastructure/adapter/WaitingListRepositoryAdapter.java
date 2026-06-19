package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.WaitingListRepositoryPort;
import com.ecc.session.domain.model.WaitingList;
import com.ecc.session.infrastructure.repository.WaitingListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WaitingListRepositoryAdapter implements WaitingListRepositoryPort {

    private final WaitingListRepository waitingListRepository;

    @Override
    public WaitingList save(WaitingList entry) {
        return waitingListRepository.save(entry);
    }

    @Override
    public boolean existsByMemberIdAndSessionId(Long memberId, Long sessionId) {
        return waitingListRepository.existsByMemberIdAndSessionId(memberId, sessionId);
    }

    @Override
    public int countBySessionId(Long sessionId) {
        return waitingListRepository.findMaxPositionBySessionId(sessionId);
    }

    @Override
    public Optional<WaitingList> findFirstWaitingBySessionId(Long sessionId) {
        return waitingListRepository.findFirstWaitingBySessionId(sessionId);
    }

    @Override
    public Optional<WaitingList> findPendingConfirmByMemberIdAndSessionId(Long memberId, Long sessionId) {
        return waitingListRepository.findPendingConfirmByMemberIdAndSessionId(memberId, sessionId);
    }

    @Override
    public List<WaitingList> findAllExpiredPendingConfirm(LocalDateTime now) {
        return waitingListRepository.findAllExpiredPendingConfirm(now);
    }
}
