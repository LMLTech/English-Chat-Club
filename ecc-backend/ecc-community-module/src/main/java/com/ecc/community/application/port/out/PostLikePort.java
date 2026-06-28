package com.ecc.community.application.port.out;

import com.ecc.community.domain.model.PostLike;
import java.util.Optional;

public interface PostLikePort {
    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);
    PostLike save(PostLike postLike);
    void delete(PostLike postLike);
}