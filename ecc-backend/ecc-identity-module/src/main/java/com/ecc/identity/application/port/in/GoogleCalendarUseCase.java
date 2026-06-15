package com.ecc.identity.application.port.in;

public interface GoogleCalendarUseCase {
    void connectGoogleCalendar(Long userId, String authCode);
    void disconnectGoogleCalendar(Long userId);
}