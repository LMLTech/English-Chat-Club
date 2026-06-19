package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.BookingRepositoryPort;
import com.ecc.session.domain.model.Booking;
import com.ecc.session.infrastructure.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BookingRepositoryAdapter implements BookingRepositoryPort {

    private final BookingRepository bookingRepository;

    @Override
    public Booking save(Booking booking) {
        return bookingRepository.save(booking);
    }

    @Override
    public Optional<Booking> findActiveByMemberIdAndSessionId(Long memberId, Long sessionId) {
        return bookingRepository.findActiveByMemberIdAndSessionId(memberId, sessionId);
    }
}
