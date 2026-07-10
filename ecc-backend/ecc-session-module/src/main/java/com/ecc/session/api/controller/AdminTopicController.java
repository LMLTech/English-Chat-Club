package com.ecc.session.api.controller;

import com.ecc.common.audit.Auditable;
import com.ecc.common.dto.ApiResponse;
import com.ecc.session.api.dto.request.TopicRequest;
import com.ecc.session.api.dto.response.TopicResponse;
import com.ecc.session.application.port.in.ManageTopicUseCase;
import com.ecc.session.domain.model.DiscussionTopic;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/topics")
@PreAuthorize("hasAuthority('ADMIN')")
@RequiredArgsConstructor
public class AdminTopicController {

    private final ManageTopicUseCase manageTopicUseCase;

    private Long getCurrentUserId(Authentication authentication) {
        return Long.parseLong(authentication.getName());
    }

    @PostMapping
    @Auditable(action = "CREATE_TOPIC", description = "Tạo chủ đề thảo luận")
    public ResponseEntity<ApiResponse<TopicResponse>> createTopic(
            @Valid @RequestBody TopicRequest request,
            Authentication authentication) {
        Long adminId = getCurrentUserId(authentication);
        DiscussionTopic topic = manageTopicUseCase.createTopic(adminId, request);
        return ResponseEntity.ok(ApiResponse.success(TopicResponse.fromEntity(topic)));
    }

    @PutMapping("/{id}")
    @Auditable(action = "UPDATE_TOPIC", description = "Cập nhật chủ đề thảo luận")
    public ResponseEntity<ApiResponse<TopicResponse>> updateTopic(
            @PathVariable Long id,
            @Valid @RequestBody TopicRequest request) {
        DiscussionTopic topic = manageTopicUseCase.updateTopic(id, request);
        return ResponseEntity.ok(ApiResponse.success(TopicResponse.fromEntity(topic)));
    }

    @PatchMapping("/{id}/toggle-status")
    @Auditable(action = "TOGGLE_TOPIC_STATUS", description = "Bật/tắt chủ đề")
    public ResponseEntity<ApiResponse<String>> toggleStatus(@PathVariable Long id) {
        manageTopicUseCase.toggleActiveStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Đã thay đổi trạng thái hiển thị của chủ đề."));
    }

    @DeleteMapping("/{id}")
    @Auditable(action = "DELETE_TOPIC", description = "Xóa chủ đề thảo luận")
    public ResponseEntity<ApiResponse<String>> deleteTopic(@PathVariable Long id) {
        manageTopicUseCase.softDeleteTopic(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa chủ đề thành công."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getAllTopicsForAdmin() {
        List<TopicResponse> responses = manageTopicUseCase.getAdminTopics().stream()
                .map(TopicResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}