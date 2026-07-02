package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.Challenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.Optional;

public interface ChallengePort {
    Challenge save(Challenge challenge);
    Optional<Challenge> findById(Long id);
    Page<Challenge> findActiveChallenges(LocalDate date, Pageable pageable);
}