package com.ecc.identity.application.port.in;

public interface AssignRoleUseCase {
    void assignRoleToUser(Long userId, String roleName);
}