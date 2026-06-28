package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.PostLikePort;
import com.ecc.community.domain.model.PostLike;
import com.ecc.community.infrastructure.repository.PostLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PostLikeRepositoryAdapter implements PostLikePort {

    private final PostLikeRepository postLikeRepository;

    @Override
    public Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId) {
        return postLikeRepository.findByPostIdAndUserId(postId, userId);
    }

    @Override
    public PostLike save(PostLike postLike) {
        return postLikeRepository.save(postLike);
    }

    @Override
    public void delete(PostLike postLike) {
        postLikeRepository.delete(postLike);
    }
}