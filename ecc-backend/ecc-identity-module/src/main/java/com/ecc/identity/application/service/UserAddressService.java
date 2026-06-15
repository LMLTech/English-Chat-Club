package com.ecc.identity.application.service;

import com.ecc.common.exception.BadRequestException;
import com.ecc.identity.api.dto.request.AddressRequest;
import com.ecc.identity.api.dto.response.AddressResponse;
import com.ecc.identity.application.port.in.UserAddressUseCase;
import com.ecc.identity.application.port.out.UserAddressRepositoryPort;
import com.ecc.identity.application.port.out.UserRepositoryPort;
import com.ecc.identity.domain.model.User;
import com.ecc.identity.domain.model.UserAddress;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAddressService implements UserAddressUseCase {

    private final UserAddressRepositoryPort addressPort;
    private final UserRepositoryPort userRepositoryPort;

    @Override
    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin người dùng"));

        // Logic: Nếu địa chỉ mới này là Mặc định, phải tắt tất cả các địa chỉ mặc định cũ đi
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressPort.resetDefaultAddress(userId);
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .province(request.getProvince())
                .district(request.getDistrict())
                .detail(request.getDetail())
                .isDefault(request.getIsDefault())
                .build();

        UserAddress saved = addressPort.save(address);
        return mapToResponse(saved);
    }

    @Override
    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressPort.findAllByUserId(userId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        UserAddress address = addressPort.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy địa chỉ này"));

        // Logic: Nếu người dùng set cờ Mặc định mới, ta reset các cờ cũ
        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            addressPort.resetDefaultAddress(userId);
        }

        address.setRecipientName(request.getRecipientName());
        address.setPhone(request.getPhone());
        address.setProvince(request.getProvince());
        address.setDistrict(request.getDistrict());
        address.setDetail(request.getDetail());
        address.setIsDefault(request.getIsDefault());

        UserAddress updated = addressPort.save(address);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        UserAddress address = addressPort.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy địa chỉ này"));
        addressPort.delete(address);
    }

    private AddressResponse mapToResponse(UserAddress address) {
        return AddressResponse.builder()
                .id(address.getId())
                .recipientName(address.getRecipientName())
                .phone(address.getPhone())
                .province(address.getProvince())
                .district(address.getDistrict())
                .detail(address.getDetail())
                .isDefault(address.getIsDefault())
                .build();
    }
}