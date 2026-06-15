package com.ecc.identity.api.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketRequest {
    private String subject;
    private String category; // TECHNICAL, ACCOUNT, COMPLAINT, OTHER
    private String priority; // LOW, MEDIUM, HIGH, URGENT
    private String message; // Nội dung tin nhắn đầu tiên
}