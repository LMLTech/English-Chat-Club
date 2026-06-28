package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.Friendship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    boolean existsByUserIdAndFriendId(Long userId, Long friendId);
    Page<Friendship> findByUserId(Long userId, Pageable pageable);
}
