package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.RoleRepositoryPort;
import com.ecc.identity.domain.model.Role;
import com.ecc.identity.infrastructure.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RoleRepositoryAdapter implements RoleRepositoryPort {

    private final RoleRepository roleRepository;

    @Override
    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }
}
