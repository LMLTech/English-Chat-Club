package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.DirectMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface DirectMessagePort {
    DirectMessage save(DirectMessage message);
    Optional<DirectMessage> findById(Long id);
    Page<DirectMessage> findConversationHistory(Long userId, Long friendId, Pageable pageable);
}