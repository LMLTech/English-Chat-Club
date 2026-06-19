package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.TopicRepositoryPort;
import com.ecc.session.domain.model.DiscussionTopic;
import com.ecc.session.infrastructure.repository.DiscussionTopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TopicRepositoryAdapter implements TopicRepositoryPort {

    private final DiscussionTopicRepository repository;

    @Override
    public DiscussionTopic save(DiscussionTopic topic) {
        return repository.save(topic);
    }

    @Override
    public Optional<DiscussionTopic> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<DiscussionTopic> findAllForAdmin() {
        return repository.findAllByDeletedAtIsNull();
    }

    @Override
    public List<DiscussionTopic> findAllActiveForMember() {
        return repository.findAllByIsActiveTrueAndDeletedAtIsNull();
    }
}