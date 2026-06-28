package com.ecc.common.event;

public class ForumPostCommentedEvent extends DomainEvent {
    private final Long postId;
    private final Long commentId;
    private final Long authorId;

    public ForumPostCommentedEvent(Long postId, Long commentId, Long authorId) {
        super();
        this.postId = postId;
        this.commentId = commentId;
        this.authorId = authorId;
    }

    public Long getPostId() { return postId; }
    public Long getCommentId() { return commentId; }
    public Long getAuthorId() { return authorId; }
}
