package com.ecc.session.application.service;

import com.ecc.common.exception.ResourceNotFoundException;
import com.ecc.session.api.dto.request.TopicRequest;
import com.ecc.session.application.port.in.ManageTopicUseCase;
import com.ecc.session.application.port.out.TopicRepositoryPort;
import com.ecc.session.domain.model.DiscussionTopic;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TopicService implements ManageTopicUseCase {

    private final TopicRepositoryPort topicRepositoryPort;

    @Override
    @Transactional
    public DiscussionTopic createTopic(Long adminId, TopicRequest request) {
        DiscussionTopic topic = DiscussionTopic.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .createdBy(adminId)
                .isActive(true)
                .build();
        return topicRepositoryPort.save(topic);
    }

    @Override
    @Transactional
    public DiscussionTopic updateTopic(Long id, TopicRequest request) {
        DiscussionTopic topic = getTopicOrThrow(id);
        topic.setTitle(request.getTitle());
        topic.setDescription(request.getDescription());
        topic.setImageUrl(request.getImageUrl());
        return topicRepositoryPort.save(topic);
    }

    @Override
    @Transactional
    public void toggleActiveStatus(Long id) {
        DiscussionTopic topic = getTopicOrThrow(id);
        topic.setIsActive(!topic.getIsActive()); // Đảo ngược trạng thái
        topicRepositoryPort.save(topic);
    }

    @Override
    @Transactional
    public void softDeleteTopic(Long id) {
        DiscussionTopic topic = getTopicOrThrow(id);
        topic.setDeletedAt(LocalDateTime.now()); // Soft delete
        topicRepositoryPort.save(topic);
    }

    @Override
    public List<DiscussionTopic> getAdminTopics() {
        return topicRepositoryPort.findAllForAdmin();
    }

    @Override
    public List<DiscussionTopic> getActiveTopics() {
        return topicRepositoryPort.findAllActiveForMember();
    }

    private DiscussionTopic getTopicOrThrow(Long id) {
        DiscussionTopic topic = topicRepositoryPort.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ đề thảo luận"));
        if (topic.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Chủ đề này đã bị xóa");
        }
        return topic;
    }
}