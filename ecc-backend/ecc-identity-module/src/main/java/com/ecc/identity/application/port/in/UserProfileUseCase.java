package com.ecc.identity.application.port.in;

import org.springframework.web.multipart.MultipartFile;
import com.ecc.identity.api.dto.request.UpdateInterestsRequest;
import com.ecc.identity.api.dto.request.UpdateProfileRequest;
import com.ecc.identity.api.dto.response.UserProfileResponse;

public interface UserProfileUseCase {
    UserProfileResponse getProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
    void updateInterests(Long userId, UpdateInterestsRequest request);
    
    // Tìm kiếm profile dựa trên một phần của email
    java.util.List<UserProfileResponse> searchProfileByEmail(String email);

    String uploadAvatar(Long userId, MultipartFile file);
    void updateAvatarFrame(Long userId, String avatarFrameUrl);
}