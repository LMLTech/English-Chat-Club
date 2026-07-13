package com.ecc.identity.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.identity.api.dto.request.UpdateInterestsRequest;
import com.ecc.identity.api.dto.request.UpdateProfileRequest;
import com.ecc.identity.api.dto.response.UserProfileResponse;
import com.ecc.identity.application.port.in.UserProfileUseCase;
import com.ecc.identity.application.port.out.UserInterestRepositoryPort;
import com.ecc.identity.application.port.out.UserRepositoryPort;
import com.ecc.identity.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserProfileService implements UserProfileUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final UserInterestRepositoryPort userInterestRepositoryPort;

    @Override
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin người dùng."));

        List<Long> categoryIds = userInterestRepositoryPort.getInterestCategoryIds(userId);

        return mapToResponse(user, categoryIds);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin người dùng."));

        // Cập nhật các trường cho phép
        user.setFullName(request.getFullName());
        user.setBio(request.getBio());
        user.setCefrLevel(request.getCefrLevel());
        user.setLearningGoal(request.getLearningGoal());
        user.setAvatarUrl(request.getAvatarUrl());

        User updatedUser = userRepositoryPort.save(user);
        List<Long> categoryIds = userInterestRepositoryPort.getInterestCategoryIds(userId);

        return mapToResponse(updatedUser, categoryIds);
    }

    @Override
    public void updateInterests(Long userId, UpdateInterestsRequest request) {
        // Kiểm tra user tồn tại
        if (userRepositoryPort.findById(userId).isEmpty()) {
            throw new BadRequestException("Không tìm thấy thông tin người dùng.");
        }

        // Cập nhật danh sách sở thích vào bảng user_interests
        userInterestRepositoryPort.updateInterests(userId, request.getCategoryIds());
    }

    @Override
    public List<UserProfileResponse> searchProfileByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return List.of();
        }
        List<User> users = userRepositoryPort.findByEmailContainingIgnoreCase(email.trim());
        return users.stream().map(user -> {
            List<Long> categoryIds = userInterestRepositoryPort.getInterestCategoryIds(user.getId());
            return mapToResponse(user, categoryIds);
        }).toList();
    }

    private UserProfileResponse mapToResponse(User user, List<Long> categoryIds) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .cefrLevel(user.getCefrLevel())
                .learningGoal(user.getLearningGoal())
                .role(user.getRoles() != null && !user.getRoles().isEmpty() ? user.getRoles().iterator().next().getName() : null)
                .is2faEnabled(Boolean.TRUE.equals(user.getIs2faEnabled()))
                .referralCode(user.getReferralCode())
                .createdAt(user.getCreatedAt())
                .interestCategoryIds(categoryIds)
                .build();
    }

    @Override
    @Transactional
    public String uploadAvatar(Long userId, org.springframework.web.multipart.MultipartFile file) {
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin người dùng."));

        if (file.isEmpty()) {
            throw new BadRequestException("File không được để trống.");
        }

        try {
            // Đảm bảo thư mục tồn tại
            java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads");
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            // Tạo tên file an toàn và duy nhất
            String originalFileName = org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
            String extension = "";
            if (originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String newFileName = "avatar_" + userId + "_" + System.currentTimeMillis() + extension;

            java.nio.file.Path filePath = uploadPath.resolve(newFileName);
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String avatarUrl = "/uploads/" + newFileName;
            user.setAvatarUrl(avatarUrl);
            userRepositoryPort.save(user);

            return avatarUrl;
        } catch (java.io.IOException ex) {
            throw new RuntimeException("Không thể lưu file tải lên.", ex);
        }
    }

    @Override
    @Transactional
    public void updateAvatarFrame(Long userId, String avatarFrameUrl) {
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin người dùng."));
        user.setAvatarFrame(avatarFrameUrl);
        userRepositoryPort.save(user);
    }
}