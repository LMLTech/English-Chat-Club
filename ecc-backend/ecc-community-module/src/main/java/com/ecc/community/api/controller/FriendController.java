package com.ecc.community.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.community.api.dto.request.friend.FriendRequestDto;
import com.ecc.community.api.dto.response.friend.FriendRequestResponse;
import com.ecc.community.application.service.FriendshipService;
import com.ecc.community.domain.model.friend.FriendRequest;
import com.ecc.community.domain.model.friend.Friendship;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('MEMBER')")
public class FriendController {

    private final FriendshipService friendshipService;

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> sendRequest(
            Authentication authentication,
            @Valid @RequestBody FriendRequestDto request
    ) {
        Long senderId = Long.parseLong(authentication.getName());
        FriendRequest friendRequest = friendshipService.sendFriendRequest(senderId, request.getReceiverId());
        return ResponseEntity.ok(ApiResponse.success(FriendRequestResponse.fromEntity(friendRequest)));
    }

    @PutMapping("/request/{id}/accept")
    public ResponseEntity<ApiResponse<String>> acceptRequest(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long receiverId = Long.parseLong(authentication.getName());
        friendshipService.acceptFriendRequest(receiverId, id);
        return ResponseEntity.ok(ApiResponse.success("Đã chấp nhận lời mời kết bạn"));
    }

    @PutMapping("/request/{id}/reject")
    public ResponseEntity<ApiResponse<String>> rejectRequest(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long receiverId = Long.parseLong(authentication.getName());
        friendshipService.rejectFriendRequest(receiverId, id);
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối lời mời kết bạn"));
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<ApiResponse<Page<FriendRequestResponse>>> getPendingRequests(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long receiverId = Long.parseLong(authentication.getName());
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<FriendRequestResponse> requests = friendshipService.getPendingRequests(receiverId, pageable)
                .map(FriendRequestResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Long>>> getFriends(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Long userId = Long.parseLong(authentication.getName());
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Long> friendIds = friendshipService.getFriends(userId, pageable)
                .stream()
                .map(Friendship::getFriendId)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(friendIds));
    }
}
