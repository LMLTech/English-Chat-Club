package com.ecc.content.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MemberDashboardResponse {
    private int totalPoints;
    private int currentLevel;
    private int totalSessionsAttended;
    private int unreadNotifications;
}