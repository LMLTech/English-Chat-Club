package com.ecc.identity.application.port.out;

import com.ecc.identity.domain.model.Role;
import java.util.Optional;

public interface RoleRepositoryPort {
    Optional<Role> findByName(String name);
}
