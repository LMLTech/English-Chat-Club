package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.DiscussionTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionTopicRepository extends JpaRepository<DiscussionTopic, Long> {
    // Lấy tất cả chủ đề chưa bị xóa mềm
    List<DiscussionTopic> findAllByDeletedAtIsNull();

    // Lấy tất cả chủ đề đang active và chưa bị xóa (dành cho Member xem)
    List<DiscussionTopic> findAllByIsActiveTrueAndDeletedAtIsNull();
}