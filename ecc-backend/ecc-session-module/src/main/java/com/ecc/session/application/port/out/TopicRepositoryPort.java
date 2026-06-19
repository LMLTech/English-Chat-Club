package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.DiscussionTopic;
import java.util.List;
import java.util.Optional;

public interface TopicRepositoryPort {
    DiscussionTopic save(DiscussionTopic topic);
    Optional<DiscussionTopic> findById(Long id);
    List<DiscussionTopic> findAllForAdmin(); // Gồm cả ẩn/hiện, miễn chưa xóa mềm
    List<DiscussionTopic> findAllActiveForMember(); // Chỉ hiện
}