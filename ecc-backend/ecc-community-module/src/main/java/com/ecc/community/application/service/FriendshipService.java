package com.ecc.community.application.service;

import com.ecc.community.application.port.out.FriendRequestPort;
import com.ecc.community.application.port.out.FriendshipPort;
import com.ecc.community.domain.model.FriendRequest;
import com.ecc.community.domain.model.FriendRequestStatus;
import com.ecc.community.domain.model.Friendship;
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

    // CHUẨN HEXAGONAL: Dùng Port thay vì Repository
    private final FriendRequestPort friendRequestPort;
    private final FriendshipPort friendshipPort;

    @Transactional
    public FriendRequest sendFriendRequest(Long senderId, Long receiverId) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("Không thể tự gửi lời mời kết bạn cho chính mình");
        }

        if (friendshipPort.existsByUserIdAndFriendId(senderId, receiverId)) {
            throw new IllegalStateException("Hai người đã là bạn bè");
        }

        if (friendRequestPort.existsBySenderIdAndReceiverIdAndStatus(senderId, receiverId, FriendRequestStatus.PENDING) ||
                friendRequestPort.existsBySenderIdAndReceiverIdAndStatus(receiverId, senderId, FriendRequestStatus.PENDING)) {
            throw new IllegalStateException("Đã có lời mời kết bạn đang chờ xử lý giữa 2 người");
        }

        FriendRequest request = friendRequestPort.findBySenderIdAndReceiverId(senderId, receiverId)
                .orElse(FriendRequest.builder()
                        .senderId(senderId)
                        .receiverId(receiverId)
                        .build());

        request.setStatus(FriendRequestStatus.PENDING);
        return friendRequestPort.save(request);
    }

    @Transactional
    public void acceptFriendRequest(Long receiverId, Long requestId) {
        FriendRequest request = friendRequestPort.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Lời mời kết bạn không tồn tại"));

        if (!request.getReceiverId().equals(receiverId)) {
            throw new SecurityException("Bạn không có quyền chấp nhận lời mời này");
        }

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalStateException("Lời mời không ở trạng thái chờ");
        }

        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequestPort.save(request);

        // Tạo 2 bản ghi Friendship cho cả 2 chiều
        if (!friendshipPort.existsByUserIdAndFriendId(request.getSenderId(), request.getReceiverId())) {
            friendshipPort.save(Friendship.builder()
                    .userId(request.getSenderId())
                    .friendId(request.getReceiverId())
                    .build());

            friendshipPort.save(Friendship.builder()
                    .userId(request.getReceiverId())
                    .friendId(request.getSenderId())
                    .build());
        }
    }

    @Transactional
    public void rejectFriendRequest(Long receiverId, Long requestId) {
        FriendRequest request = friendRequestPort.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Lời mời kết bạn không tồn tại"));

        if (!request.getReceiverId().equals(receiverId)) {
            throw new SecurityException("Bạn không có quyền từ chối lời mời này");
        }

        request.setStatus(FriendRequestStatus.REJECTED);
        friendRequestPort.save(request);
    }

    @Transactional(readOnly = true)
    public Page<FriendRequest> getPendingRequests(Long receiverId, Pageable pageable) {
        return friendRequestPort.findByReceiverIdAndStatus(receiverId, FriendRequestStatus.PENDING, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Friendship> getFriends(Long userId, Pageable pageable) {
        return friendshipPort.findByUserId(userId, pageable);
    }
}