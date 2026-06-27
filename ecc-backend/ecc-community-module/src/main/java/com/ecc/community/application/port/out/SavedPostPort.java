package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.SavedPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface SavedPostPort {
    Optional<SavedPost> findByPostIdAndUserId(Long postId, Long userId);
    Page<SavedPost> findByUserId(Long userId, Pageable pageable);
    SavedPost save(SavedPost savedPost);
    void delete(SavedPost savedPost);
}