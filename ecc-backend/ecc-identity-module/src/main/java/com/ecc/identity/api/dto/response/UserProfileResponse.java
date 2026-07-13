package com.ecc.identity.api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserProfileResponse {
    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private String cefrLevel;
    private String learningGoal;
    private String role;
    @com.fasterxml.jackson.annotation.JsonProperty("is2faEnabled")
    private boolean is2faEnabled;
    private String referralCode;
    private String avatarFrame;
    private LocalDateTime createdAt;

    // Danh sách các ID của topic_categories mà user quan tâm
    private List<Long> interestCategoryIds;

    public static UserProfileResponse fromEntity(com.ecc.identity.domain.model.User user) {
        String roleStr = user.getRoles().stream()
                .findFirst()
                .map(com.ecc.identity.domain.model.Role::getName)
                .orElse("MEMBER");
                
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .cefrLevel(user.getCefrLevel())
                .learningGoal(user.getLearningGoal())
                .role(roleStr)
                .is2faEnabled(Boolean.TRUE.equals(user.getIs2faEnabled()))
                .referralCode(user.getReferralCode())
                .avatarFrame(user.getAvatarFrame())
                .createdAt(user.getCreatedAt())
                .build();
    }
}