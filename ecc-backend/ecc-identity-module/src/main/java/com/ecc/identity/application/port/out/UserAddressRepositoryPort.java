package com.ecc.identity.application.port.out;

import com.ecc.identity.domain.model.UserAddress;
import java.util.List;
import java.util.Optional;

public interface UserAddressRepositoryPort {
    List<UserAddress> findAllByUserId(Long userId);
    Optional<UserAddress> findByIdAndUserId(Long addressId, Long userId);
    UserAddress save(UserAddress address);
    void delete(UserAddress address);
    // Hàm chuyên dụng để tắt cờ Mặc định của các địa chỉ cũ
    void resetDefaultAddress(Long userId);
}