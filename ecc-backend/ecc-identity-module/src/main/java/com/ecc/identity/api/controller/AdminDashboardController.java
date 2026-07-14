package com.ecc.identity.api.controller;

import com.ecc.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> response = new HashMap<>();

        // 1. Tổng người dùng
        Integer totalUsers = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
        
        // 2. Phòng đang hoạt động (Đã duyệt và chưa kết thúc)
        Integer activeSessions = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM sessions WHERE room_status = 'APPROVED' AND status IN ('SCHEDULED', 'ONGOING')", Integer.class);
        if (activeSessions == null) activeSessions = 0;

        // 3. Sự kiện sắp tới
        Integer upcomingEvents = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM events WHERE status = 'UPCOMING'", Integer.class);
        if (upcomingEvents == null) upcomingEvents = 0;

        // 4. Báo cáo cần xử lý (Support tickets OPEN)
        Integer pendingTickets = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM support_tickets WHERE status = 'OPEN'", Integer.class);
        if (pendingTickets == null) pendingTickets = 0;

        response.put("totalUsers", totalUsers != null ? totalUsers : 0);
        response.put("activeSessions", activeSessions);
        response.put("upcomingEvents", upcomingEvents);
        response.put("pendingTickets", pendingTickets);

        // 5. Lưu lượng truy cập (Mocking 7 days trend based on real base data for visual)
        // Trong hệ thống thật, cần truy vấn bảng audit_logs hoặc sessions theo group by date.
        List<Map<String, Object>> trafficData = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        for (int i = 6; i >= 0; i--) {
            Map<String, Object> dayStat = new HashMap<>();
            LocalDate date = today.minusDays(i);
            dayStat.put("name", date.format(formatter));
            
            // 5.1 Số lượng users mới đăng ký trong ngày
            Integer dailyUsers = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE DATE(created_at) = ?", 
                Integer.class, 
                java.sql.Date.valueOf(date));
            
            // 5.2 Số lượng sessions được tạo trong ngày
            Integer dailySessions = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM sessions WHERE DATE(created_at) = ?", 
                Integer.class, 
                java.sql.Date.valueOf(date));
            
            dayStat.put("users", dailyUsers != null ? dailyUsers : 0);
            dayStat.put("sessions", dailySessions != null ? dailySessions : 0);
            trafficData.add(dayStat);
        }
        
        response.put("trafficData", trafficData);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
