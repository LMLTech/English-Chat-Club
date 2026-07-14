package com.ecc.session.infrastructure.adapter;

import com.ecc.session.application.port.out.VocabularyHighlightRepositoryPort;
import com.ecc.session.domain.model.VocabularyHighlight;
import com.ecc.session.infrastructure.repository.VocabularyHighlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
@RequiredArgsConstructor
public class VocabularyHighlightRepositoryAdapter implements VocabularyHighlightRepositoryPort {

    private final VocabularyHighlightRepository repository;

    @Override
    public VocabularyHighlight save(VocabularyHighlight entity) {
        return repository.save(entity);
    }

    @Override
    public Optional<VocabularyHighlight> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<VocabularyHighlight> findAll() {
        return repository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
    
    @Override
    public void delete(VocabularyHighlight entity) {
        repository.delete(entity);
    }

    @Override
    public List<VocabularyHighlight> findBySessionId(Long sessionId) {
        return repository.findBySessionId(sessionId);
    }
}
