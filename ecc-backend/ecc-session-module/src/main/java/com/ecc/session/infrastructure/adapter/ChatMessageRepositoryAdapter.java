package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.ChatMessageRepositoryPort;
import com.ecc.session.domain.model.ChatMessage;
import com.ecc.session.infrastructure.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ChatMessageRepositoryAdapter implements ChatMessageRepositoryPort {

    private final ChatMessageRepository repository;

    @Override
    public ChatMessage save(ChatMessage entity) {
        return repository.save(entity);
    }

    @Override
    public Optional<ChatMessage> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<ChatMessage> findAll() {
        return repository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
    
    @Override
    public void delete(ChatMessage entity) {
        repository.delete(entity);
    }

    @Override
    public long countBySessionAndIsPinnedTrue(com.ecc.session.domain.model.Session session) {
        return repository.countBySessionAndIsPinnedTrue(session);
    }
}
