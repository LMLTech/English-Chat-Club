package com.ecc.identity.application.port.in;

import com.ecc.identity.api.dto.request.UpdateInterestsRequest;
import com.ecc.identity.api.dto.request.UpdateProfileRequest;
import com.ecc.identity.api.dto.response.UserProfileResponse;

public interface UserProfileUseCase {
    UserProfileResponse getProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
    void updateInterests(Long userId, UpdateInterestsRequest request);
}