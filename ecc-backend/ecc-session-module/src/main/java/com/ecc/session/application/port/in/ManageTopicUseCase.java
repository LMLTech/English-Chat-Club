package com.ecc.session.application.port.in;

import com.ecc.session.api.dto.request.TopicRequest;
import com.ecc.session.domain.model.DiscussionTopic;
import java.util.List;

public interface ManageTopicUseCase {
    DiscussionTopic createTopic(Long adminId, TopicRequest request);
    DiscussionTopic updateTopic(Long id, TopicRequest request);
    void toggleActiveStatus(Long id);
    void softDeleteTopic(Long id);
    List<DiscussionTopic> getAdminTopics();
    List<DiscussionTopic> getActiveTopics();
}