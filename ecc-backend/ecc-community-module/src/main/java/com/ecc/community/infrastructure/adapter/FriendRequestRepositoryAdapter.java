package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.FriendRequestPort;
import com.ecc.community.domain.model.FriendRequest;
import com.ecc.community.domain.model.FriendRequestStatus;
import com.ecc.community.infrastructure.repository.FriendRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class FriendRequestRepositoryAdapter implements FriendRequestPort {

    private final FriendRequestRepository requestRepository;

    @Override
    public boolean existsBySenderIdAndReceiverIdAndStatus(Long senderId, Long receiverId, FriendRequestStatus status) {
        return requestRepository.existsBySenderIdAndReceiverIdAndStatus(senderId, receiverId, status);
    }

    @Override
    public Optional<FriendRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId) {
        return requestRepository.findBySenderIdAndReceiverId(senderId, receiverId);
    }

    @Override
    public Optional<FriendRequest> findById(Long id) {
        return requestRepository.findById(id);
    }

    @Override
    public Page<FriendRequest> findByReceiverIdAndStatus(Long receiverId, FriendRequestStatus status, Pageable pageable) {
        return requestRepository.findByReceiverIdAndStatus(receiverId, status, pageable);
    }

    @Override
    public FriendRequest save(FriendRequest request) {
        return requestRepository.save(request);
    }
}