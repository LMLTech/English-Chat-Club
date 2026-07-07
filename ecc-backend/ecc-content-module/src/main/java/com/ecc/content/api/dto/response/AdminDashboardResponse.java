package com.ecc.content.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardResponse {
    private int totalUsers;
    private int newUsersThisMonth;
    private int activeSessions;
    private int totalCampaignsSent;
}