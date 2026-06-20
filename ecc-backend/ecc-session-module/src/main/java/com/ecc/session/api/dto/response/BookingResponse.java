package com.ecc.session.api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long bookingId;
    private String bookingUuid;
    private Long sessionId;
    private String sessionTitle;
    private Long memberId;
    private String status;           // CONFIRMED hoặc WAITING
    private Integer waitingPosition; // null nếu CONFIRMED, số thứ tự nếu WAITING
    private LocalDateTime createdAt;
}
