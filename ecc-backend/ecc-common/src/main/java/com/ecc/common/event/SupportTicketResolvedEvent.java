package com.ecc.common.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SupportTicketResolvedEvent extends DomainEvent {
    private Long memberId;
    private Long ticketId;
    private String subject;
    private String replyMessage;
}
