package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.VocabularyHighlight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VocabularyHighlightRepository extends JpaRepository<VocabularyHighlight, Long> {
    java.util.List<VocabularyHighlight> findBySessionId(Long sessionId);
}
