package com.ecc.community.application.service;

import com.ecc.community.domain.model.friend.FriendRequest;
import com.ecc.community.domain.model.friend.FriendRequestStatus;
import com.ecc.community.domain.model.friend.Friendship;
import com.ecc.community.infrastructure.repository.FriendRequestRepository;
import com.ecc.community.infrastructure.repository.FriendshipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendRequestRepository friendRequestRepository;
    private final FriendshipRepository friendshipRepository;

    @Transactional
    public FriendRequest sendFriendRequest(Long senderId, Long receiverId) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("Không thể tự gửi lời mời kết bạn cho chính mình");
        }

        if (friendshipRepository.existsByUserIdAndFriendId(senderId, receiverId)) {
            throw new IllegalStateException("Hai người đã là bạn bè");
        }

        if (friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(senderId, receiverId, FriendRequestStatus.PENDING) ||
            friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(receiverId, senderId, FriendRequestStatus.PENDING)) {
            throw new IllegalStateException("Đã có lời mời kết bạn đang chờ xử lý giữa 2 người");
        }

        FriendRequest request = friendRequestRepository.findBySenderIdAndReceiverId(senderId, receiverId)
                .orElse(FriendRequest.builder()
                        .senderId(senderId)
                        .receiverId(receiverId)
                        .build());
        
        request.setStatus(FriendRequestStatus.PENDING);
        return friendRequestRepository.save(request);
    }

    @Transactional
    public void acceptFriendRequest(Long receiverId, Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Lời mời kết bạn không tồn tại"));

        if (!request.getReceiverId().equals(receiverId)) {
            throw new SecurityException("Bạn không có quyền chấp nhận lời mời này");
        }

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalStateException("Lời mời không ở trạng thái chờ");
        }

        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);

        // Tạo 2 bản ghi Friendship
        if (!friendshipRepository.existsByUserIdAndFriendId(request.getSenderId(), request.getReceiverId())) {
            friendshipRepository.save(Friendship.builder()
                    .userId(request.getSenderId())
                    .friendId(request.getReceiverId())
                    .build());
            
            friendshipRepository.save(Friendship.builder()
                    .userId(request.getReceiverId())
                    .friendId(request.getSenderId())
                    .build());
        }
    }

    @Transactional
    public void rejectFriendRequest(Long receiverId, Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Lời mời kết bạn không tồn tại"));

        if (!request.getReceiverId().equals(receiverId)) {
            throw new SecurityException("Bạn không có quyền từ chối lời mời này");
        }

        request.setStatus(FriendRequestStatus.REJECTED);
        friendRequestRepository.save(request);
    }

    @Transactional(readOnly = true)
    public Page<FriendRequest> getPendingRequests(Long receiverId, Pageable pageable) {
        return friendRequestRepository.findByReceiverIdAndStatus(receiverId, FriendRequestStatus.PENDING, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Friendship> getFriends(Long userId, Pageable pageable) {
        return friendshipRepository.findByUserId(userId, pageable);
    }
}
