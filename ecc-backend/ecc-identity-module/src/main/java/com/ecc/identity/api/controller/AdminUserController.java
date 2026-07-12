package com.ecc.identity.api.controller;

import com.ecc.common.audit.Auditable;
import com.ecc.common.dto.ApiResponse;
import com.ecc.identity.api.dto.response.UserProfileResponse;
import com.ecc.identity.application.port.in.AssignRoleUseCase;
import com.ecc.identity.application.port.in.ManageUserUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AssignRoleUseCase assignRoleUseCase;
    private final ManageUserUseCase manageUserUseCase;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(manageUserUseCase.getAllUsers()));
    }

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Auditable(action = "ASSIGN_ROLE", description = "Admin thay đổi role của user")
    public ResponseEntity<ApiResponse<String>> assignRole(
            @PathVariable Long userId,
            @RequestParam String roleName) {

        assignRoleUseCase.assignRoleToUser(userId, roleName);
        return ResponseEntity.ok(ApiResponse.success("Nâng cấp thành viên thành " + roleName + " thành công!"));
    }
}