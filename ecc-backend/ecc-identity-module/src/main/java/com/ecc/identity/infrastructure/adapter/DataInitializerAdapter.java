package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.domain.model.Permission;
import com.ecc.identity.domain.model.Role;
import com.ecc.identity.domain.model.User;
import com.ecc.identity.infrastructure.repository.PermissionRepository;
import com.ecc.identity.infrastructure.repository.RoleRepository;
import com.ecc.identity.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataInitializerAdapter implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // 1. Khởi tạo Permissions nếu chưa có
        Permission adminAccess = createPermissionIfNotFound("admin:access", "Quyền truy cập trang quản trị");
        Permission userBan = createPermissionIfNotFound("user:ban", "Quyền khóa tài khoản");
        Permission roomCreate = createPermissionIfNotFound("room:create", "Quyền tạo phòng chat");

        // 2. Khởi tạo Roles nếu chưa có
        Role adminRole = createRoleIfNotFound("ADMIN", "Quản trị viên hệ thống");
        Role memberRole = createRoleIfNotFound("MEMBER", "Thành viên thông thường");
        Role moderatorRole = createRoleIfNotFound("MODERATOR", "Điều phối viên phòng chat");

        // Gán quyền cho ADMIN
        if (adminRole.getPermissions().isEmpty()) {
            adminRole.addPermission(adminAccess);
            adminRole.addPermission(userBan);
            adminRole.addPermission(roomCreate);
            roleRepository.save(adminRole);
        }

        // 3. Khởi tạo tài khoản ADMIN mặc định
        if (!userRepository.existsByEmail("admin@gmail.com")) {
            System.out.println("⏳ Đang khởi tạo hệ thống phân quyền (RBAC) và tài khoản ADMIN...");

            User admin = User.builder()
                    .uuid(UUID.randomUUID())
                    .email("admin@gmail.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .fullName("Quản Trị Viên ECC")
                    .status("ACTIVE")
                    .is2faEnabled(false)
                    .build();

            // Gán Role ADMIN cho User này
            admin.addRole(adminRole);

            userRepository.save(admin);
            System.out.println("✅ Khởi tạo thành công! tài khoản admin");
        }
    }

    private Permission createPermissionIfNotFound(String name, String description) {
        return permissionRepository.findByName(name)
                .orElseGet(() -> permissionRepository.save(
                        Permission.builder().name(name).description(description).build()
                ));
    }

    private Role createRoleIfNotFound(String name, String description) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(name).description(description).build()
                ));
    }
}