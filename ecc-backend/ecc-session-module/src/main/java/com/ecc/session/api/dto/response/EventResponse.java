package com.ecc.session.api.dto.response;

import com.ecc.session.domain.model.Event;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private Integer pointsRequired;
    private Integer rewardPoints; 
    private Integer registeredCount;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    public static EventResponse fromEntity(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .imageUrl(event.getImageUrl())
                .pointsRequired(event.getPointsRequired())
                .rewardPoints(event.getRewardPoints())
                .status(event.getStatus())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .build();
    }
    
    public static EventResponse fromEntityWithCount(Event event, Integer registeredCount) {
        EventResponse response = fromEntity(event);
        response.setRegisteredCount(registeredCount);
        return response;
    }
}