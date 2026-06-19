package com.ecc.session.api.dto.response;

import com.ecc.session.domain.model.Session;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SessionResponse {
    private Long id;
    private String uuid;
    private Long topicId;
    private String topicTitle;
    private Long moderatorId;
    private String title;
    private String description;
    private String coverImage;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private String requiredLevel;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String roomStatus;
    private LocalDateTime createdAt;

    public static SessionResponse fromEntity(Session session) {
        return SessionResponse.builder()
                .id(session.getId())
                .uuid(session.getUuid().toString())
                .topicId(session.getTopic().getId())
                .topicTitle(session.getTopic().getTitle())
                .moderatorId(session.getModeratorId())
                .title(session.getTitle())
                .description(session.getDescription())
                .coverImage(session.getCoverImage())
                .maxParticipants(session.getMaxParticipants())
                .currentParticipants(session.getCurrentParticipants())
                .requiredLevel(session.getRequiredLevel())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .status(session.getStatus())
                .roomStatus(session.getRoomStatus())
                .createdAt(session.getCreatedAt())
                .build();
    }
}