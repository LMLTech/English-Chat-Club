package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.Friendship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FriendshipPort {
    boolean existsByUserIdAndFriendId(Long userId, Long friendId);
    Page<Friendship> findByUserId(Long userId, Pageable pageable);
    Friendship save(Friendship friendship);
}