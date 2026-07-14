package com.ecc.content.application.service;

import com.ecc.common.event.SupportTicketResolvedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class SupportEventListener {

    private final NotificationService notificationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleSupportTicketResolvedEvent(SupportTicketResolvedEvent event) {
        log.info("Received SupportTicketResolvedEvent for member {}: Ticket ID {}", event.getMemberId(), event.getTicketId());

        String title = "Phản hồi từ Admin";
        String content = "Yêu cầu hỗ trợ của bạn về '" + event.getSubject() + "' đã được phản hồi: " + event.getReplyMessage();

        notificationService.createNotification(event.getMemberId(), title, content, "SYSTEM");
    }
}
