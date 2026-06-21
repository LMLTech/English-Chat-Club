package com.ecc.session.api.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class UpdateAttendanceRequest {
    @NotEmpty(message = "List of attended user IDs is required")
    private List<Long> attendedUserIds;
}
