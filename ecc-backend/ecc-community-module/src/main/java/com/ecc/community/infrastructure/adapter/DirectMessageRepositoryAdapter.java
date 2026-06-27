package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.DirectMessagePort;
import com.ecc.community.domain.model.DirectMessage;
import com.ecc.community.infrastructure.repository.DirectMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DirectMessageRepositoryAdapter implements DirectMessagePort {

    private final DirectMessageRepository messageRepository;

    @Override
    public DirectMessage save(DirectMessage message) {
        return messageRepository.save(message);
    }

    @Override
    public Optional<DirectMessage> findById(Long id) {
        return messageRepository.findById(id);
    }

    @Override
    public Page<DirectMessage> findConversationHistory(Long userId, Long friendId, Pageable pageable) {
        return messageRepository.findConversationHistory(userId, friendId, pageable);
    }
}