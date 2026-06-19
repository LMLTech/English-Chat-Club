package com.ecc.session.api.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SessionRequest {

    @NotNull(message = "ID Chủ đề không được để trống")
    private Long topicId;

    @NotBlank(message = "Tiêu đề phòng không được để trống")
    private String title;

    private String description;
    private String coverImage;

    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa tối thiểu là 1 người")
    private Integer maxParticipants;

    private String requiredLevel; // Có thể null (A1, A2, B1...)

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @Future(message = "Thời gian bắt đầu phải ở tương lai")
    private LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    @Future(message = "Thời gian kết thúc phải ở tương lai")
    private LocalDateTime endTime;
}