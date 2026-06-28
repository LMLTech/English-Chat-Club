package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.FriendshipPort;
import com.ecc.community.domain.model.Friendship;
import com.ecc.community.infrastructure.repository.FriendshipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FriendshipRepositoryAdapter implements FriendshipPort {

    private final FriendshipRepository friendshipRepository;

    @Override
    public boolean existsByUserIdAndFriendId(Long userId, Long friendId) {
        return friendshipRepository.existsByUserIdAndFriendId(userId, friendId);
    }

    @Override
    public Page<Friendship> findByUserId(Long userId, Pageable pageable) {
        return friendshipRepository.findByUserId(userId, pageable);
    }

    @Override
    public Friendship save(Friendship friendship) {
        return friendshipRepository.save(friendship);
    }
}