package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.friend.FriendRequest;
import com.ecc.community.domain.model.friend.FriendRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    boolean existsBySenderIdAndReceiverIdAndStatus(Long senderId, Long receiverId, FriendRequestStatus status);
    Optional<FriendRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
    Page<FriendRequest> findByReceiverIdAndStatus(Long receiverId, FriendRequestStatus status, Pageable pageable);
}
