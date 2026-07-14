package com.ecc.session.application.port.out;

import com.ecc.session.domain.model.VocabularyHighlight;
import java.util.Optional;
import java.util.List;

public interface VocabularyHighlightRepositoryPort {
    VocabularyHighlight save(VocabularyHighlight entity);
    Optional<VocabularyHighlight> findById(Long id);
    List<VocabularyHighlight> findAll();
    void deleteById(Long id);
    void delete(VocabularyHighlight entity);
    List<VocabularyHighlight> findBySessionId(Long sessionId);
}
