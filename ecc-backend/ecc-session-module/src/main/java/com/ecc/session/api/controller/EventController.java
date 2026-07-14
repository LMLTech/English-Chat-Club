package com.ecc.session.api.controller;

import com.ecc.common.dto.ApiResponse;
import com.ecc.session.application.port.in.ManageEventUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ecc.session.api.dto.response.EventResponse;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final ManageEventUseCase eventService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        return ResponseEntity.ok(ApiResponse.success(eventService.getAllEvents()));
    }

    @PostMapping("/{id}/register")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> registerForEvent(
            @PathVariable Long id,
            Authentication principal) {
        Long userId = Long.parseLong(principal.getName());
        eventService.registerForEvent(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/my-registrations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Long>>> getMyRegistrations(Authentication principal) {
        Long userId = Long.parseLong(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(eventService.getMyRegistrations(userId)));
    }
}
