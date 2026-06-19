package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.WaitingListRepositoryPort;
import com.ecc.session.domain.model.WaitingList;
import com.ecc.session.infrastructure.repository.WaitingListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

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
        // Dùng findMaxPositionBySessionId để tính position tiếp theo (max + 1)
        return waitingListRepository.findMaxPositionBySessionId(sessionId);
    }
}
