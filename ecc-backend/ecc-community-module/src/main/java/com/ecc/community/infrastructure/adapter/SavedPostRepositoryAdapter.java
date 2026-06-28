package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.SavedPostPort;
import com.ecc.community.domain.model.SavedPost;
import com.ecc.community.infrastructure.repository.SavedPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SavedPostRepositoryAdapter implements SavedPostPort {

    private final SavedPostRepository savedPostRepository;

    @Override
    public Optional<SavedPost> findByPostIdAndUserId(Long postId, Long userId) {
        return savedPostRepository.findByPostIdAndUserId(postId, userId);
    }

    @Override
    public Page<SavedPost> findByUserId(Long userId, Pageable pageable) {
        return savedPostRepository.findByUserId(userId, pageable);
    }

    @Override
    public SavedPost save(SavedPost savedPost) {
        return savedPostRepository.save(savedPost);
    }

    @Override
    public void delete(SavedPost savedPost) {
        savedPostRepository.delete(savedPost);
    }
}