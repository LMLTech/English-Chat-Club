package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.ChatMessage;
import java.util.Optional;
import java.util.List;

public interface ChatMessageRepositoryPort {
    ChatMessage save(ChatMessage entity);
    Optional<ChatMessage> findById(Long id);
    List<ChatMessage> findAll();
    void deleteById(Long id);
    void delete(ChatMessage entity);
    long countBySessionAndIsPinnedTrue(com.ecc.session.domain.model.Session session);
}
