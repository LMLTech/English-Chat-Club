package com.ecc.identity.application.service;

import com.ecc.common.exception.ResourceNotFoundException;
import com.ecc.identity.application.port.in.AssignRoleUseCase;
import com.ecc.identity.domain.model.Role;
import com.ecc.identity.domain.model.User;
import com.ecc.identity.infrastructure.repository.RoleRepository;
import com.ecc.identity.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AssignRoleService implements AssignRoleUseCase {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public void assignRoleToUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        Role role = roleRepository.findByName(roleName.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quyền: " + roleName));

        // Thêm quyền mới vào danh sách quyền của User
        user.addRole(role);
        userRepository.save(user);
    }
}