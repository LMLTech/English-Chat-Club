package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.FriendRequest;
import com.ecc.community.domain.model.FriendRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface FriendRequestPort {
    boolean existsBySenderIdAndReceiverIdAndStatus(Long senderId, Long receiverId, FriendRequestStatus status);
    Optional<FriendRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
    Optional<FriendRequest> findById(Long id);
    Page<FriendRequest> findByReceiverIdAndStatus(Long receiverId, FriendRequestStatus status, Pageable pageable);
    FriendRequest save(FriendRequest request);
}