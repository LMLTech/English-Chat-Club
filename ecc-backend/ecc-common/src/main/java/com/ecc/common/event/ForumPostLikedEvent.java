package com.ecc.common.event;

public class ForumPostLikedEvent extends DomainEvent {
    private final Long postId;
    private final Long likedByUserId;

    public ForumPostLikedEvent(Long postId, Long likedByUserId) {
        super();
        this.postId = postId;
        this.likedByUserId = likedByUserId;
    }

    public Long getPostId() { return postId; }
    public Long getLikedByUserId() { return likedByUserId; }
}
