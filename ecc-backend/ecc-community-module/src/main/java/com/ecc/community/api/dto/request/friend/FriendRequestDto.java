package com.ecc.community.api.dto.request.friend;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FriendRequestDto {
    @NotNull(message = "Receiver ID không được để trống")
    private Long receiverId;
}
