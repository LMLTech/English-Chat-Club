package com.ecc.session.api.dto.request;

import lombok.Data;

@Data
public class ChatMessageRequest {

    // Nội dung tin nhắn (Có thể null nếu sau này bạn làm tính năng gửi riêng file ghi âm/ảnh)
    private String content;

    // Loại tin nhắn: TEXT, VOICE, SYSTEM (Mặc định ở service đã xử lý là TEXT nếu null)
    private String type;
}