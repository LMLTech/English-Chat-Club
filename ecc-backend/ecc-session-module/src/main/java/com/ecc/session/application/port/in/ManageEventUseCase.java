package com.ecc.session.application.port.in;

import com.ecc.session.api.dto.request.CreateEventRequest;
import com.ecc.session.api.dto.request.UpdateAttendanceRequest;
import com.ecc.session.api.dto.response.EventResponse;

import java.util.List;

public interface ManageEventUseCase {
    EventResponse createEvent(CreateEventRequest request);
    EventResponse updateEvent(Long id, CreateEventRequest request);
    List<EventResponse> getAllEvents();
    void registerForEvent(Long eventId, Long userId);
    void updateAttendances(Long eventId, UpdateAttendanceRequest request);
    List<Long> getMyRegistrations(Long userId);
}
