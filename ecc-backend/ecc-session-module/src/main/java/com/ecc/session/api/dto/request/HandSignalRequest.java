package com.ecc.session.api.dto.request;

import lombok.Data;

@Data
public class HandSignalRequest {
    // Action: RAISE (giơ tay), LOWER (hạ tay), APPROVE (duyệt), REJECT (từ chối), MUTE (tắt mic)
    private String action;

    // Nếu Moderator thao tác, họ truyền targetUserId là ID của Member muốn cấp quyền
    // Nếu Member tự giơ tay, có thể bỏ trống (Server tự lấy từ JWT)
    private Long targetUserId;
}