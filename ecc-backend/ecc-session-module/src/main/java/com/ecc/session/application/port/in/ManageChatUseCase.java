package com.ecc.session.application.port.in;

import com.ecc.session.api.dto.request.ChatMessageRequest;
import com.ecc.session.api.dto.response.ChatMessageResponse;

public interface ManageChatUseCase {
    ChatMessageResponse processAndSaveMessage(Long sessionId, Long senderId, ChatMessageRequest request);
    void deleteMessage(Long messageId, Long requesterId);
    void pinMessage(Long messageId, Long requesterId);
}
