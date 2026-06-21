package com.ecc.session.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.session.api.dto.request.CreateEventRequest;
import com.ecc.session.api.dto.request.UpdateAttendanceRequest;
import com.ecc.session.api.dto.response.EventResponse;
import com.ecc.session.application.port.out.PointsPort;
import com.ecc.session.domain.model.Event;
import com.ecc.session.domain.model.EventRegistration;
import com.ecc.session.infrastructure.repository.EventRegistrationRepository;
import com.ecc.session.infrastructure.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final PointsPort pointsPort;

    @Transactional
    public EventResponse createEvent(CreateEventRequest request) {
        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .pointsRequired(request.getPointsRequired())
                .status("UPCOMING")
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        event = eventRepository.save(event);
        return EventResponse.fromEntity(event);
    }

    @Transactional
    public void registerForEvent(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new BadRequestException("Sự kiện không tồn tại"));

        if (!"UPCOMING".equals(event.getStatus())) {
            throw new BadRequestException("Không thể đăng ký sự kiện này do trạng thái hiện tại là " + event.getStatus());
        }

        if (eventRegistrationRepository.existsByEventAndUserId(event, userId)) {
            throw new BadRequestException("Bạn đã đăng ký sự kiện này rồi");
        }

        // Trừ điểm nếu yêu cầu
        if (event.getPointsRequired() > 0) {
            pointsPort.deductPoints(userId, event.getPointsRequired(), "Đăng ký sự kiện: " + event.getTitle());
        }

        EventRegistration registration = EventRegistration.builder()
                .event(event)
                .userId(userId)
                .status("REGISTERED")
                .build();

        eventRegistrationRepository.save(registration);
    }

    @Transactional
    public void updateAttendances(Long eventId, UpdateAttendanceRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new BadRequestException("Sự kiện không tồn tại"));

        List<Long> attendedUserIds = request.getAttendedUserIds();
        
        for (Long userId : attendedUserIds) {
            EventRegistration registration = eventRegistrationRepository.findByEventAndUserId(event, userId)
                    .orElse(null);
            
            if (registration != null && "REGISTERED".equals(registration.getStatus())) {
                registration.setStatus("ATTENDED");
                eventRegistrationRepository.save(registration);
                
                // Cộng điểm thưởng sau khi tham gia (ví dụ sự kiện thưởng 50 điểm)
                // TODO: Số điểm thưởng có thể lấy từ cấu hình hoặc entity Event
                int rewardPoints = 50; 
                pointsPort.addPoints(userId, rewardPoints, "Tham gia sự kiện: " + event.getTitle());
            }
        }

        event.setStatus("COMPLETED");
        eventRepository.save(event);
    }
}
