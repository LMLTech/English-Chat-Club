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
    private boolean is2faEnabled;
    private String referralCode;
    private LocalDateTime createdAt;

    // Danh sách các ID của topic_categories mà user quan tâm
    private List<Long> interestCategoryIds;
}