package com.ecc.identity.application.service;

import com.ecc.identity.api.dto.response.UserProfileResponse;
import com.ecc.identity.application.port.in.ManageUserUseCase;
import com.ecc.identity.application.port.out.UserRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManageUserService implements ManageUserUseCase {

    private final UserRepositoryPort userRepositoryPort;

    @Override
    public List<UserProfileResponse> getAllUsers() {
        return userRepositoryPort.findAll().stream()
                .map(UserProfileResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
