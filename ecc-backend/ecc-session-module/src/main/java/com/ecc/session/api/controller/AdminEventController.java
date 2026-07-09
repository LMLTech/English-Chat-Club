package com.ecc.session.api.controller;

import com.ecc.common.audit.Auditable;
import com.ecc.common.dto.ApiResponse;
import com.ecc.session.api.dto.request.CreateEventRequest;
import com.ecc.session.api.dto.request.UpdateAttendanceRequest;
import com.ecc.session.api.dto.response.EventResponse;
import com.ecc.session.application.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/events")
@PreAuthorize("hasAuthority('ADMIN')")
@RequiredArgsConstructor
public class AdminEventController {

    private final EventService eventService;

    @PostMapping
    @Auditable(action = "CREATE_EVENT", description = "Tạo sự kiện")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @Valid @RequestBody CreateEventRequest request) {
        EventResponse response = eventService.createEvent(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/attendances")
    @Auditable(action = "UPDATE_ATTENDANCE", description = "Cập nhật điểm danh")
    public ResponseEntity<ApiResponse<Void>> updateAttendances(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAttendanceRequest request) {
        eventService.updateAttendances(id, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
