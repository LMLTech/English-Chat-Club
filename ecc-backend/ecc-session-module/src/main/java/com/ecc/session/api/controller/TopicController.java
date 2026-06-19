package com.ecc.session.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.session.application.port.in.ManageTopicUseCase;
import com.ecc.session.domain.model.DiscussionTopic;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final ManageTopicUseCase manageTopicUseCase;

    // API public hoặc dành cho Member xem danh sách chủ đề đang hoạt động
    @GetMapping
    public ResponseEntity<ApiResponse<List<DiscussionTopic>>> getActiveTopics() {
        return ResponseEntity.ok(ApiResponse.success(manageTopicUseCase.getActiveTopics()));
    }
}