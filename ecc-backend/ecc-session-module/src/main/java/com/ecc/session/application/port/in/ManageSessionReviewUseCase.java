package com.ecc.session.application.port.in;

import com.ecc.session.api.dto.request.CreateReviewRequest;

public interface ManageSessionReviewUseCase {
    void createReview(Long sessionId, Long reviewerId, CreateReviewRequest request);
    java.util.List<com.ecc.session.api.dto.response.ReviewResponse> getReviewsForModerator(Long moderatorId);
}
