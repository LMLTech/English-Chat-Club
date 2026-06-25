package com.ecc.community.api.dto.response.friend;

import com.ecc.community.domain.model.friend.FriendRequest;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FriendRequestResponse {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String status;
    private LocalDateTime createdAt;

    public static FriendRequestResponse fromEntity(FriendRequest request) {
        return FriendRequestResponse.builder()
                .id(request.getId())
                .senderId(request.getSenderId())
                .receiverId(request.getReceiverId())
                .status(request.getStatus().name())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
