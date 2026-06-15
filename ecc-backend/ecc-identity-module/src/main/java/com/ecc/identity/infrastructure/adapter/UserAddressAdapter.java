package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.UserAddressRepositoryPort;
import com.ecc.identity.domain.model.UserAddress;
import com.ecc.identity.infrastructure.repository.UserAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserAddressAdapter implements UserAddressRepositoryPort {

    private final UserAddressRepository repository;

    @Override
    public List<UserAddress> findAllByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public Optional<UserAddress> findByIdAndUserId(Long addressId, Long userId) {
        return repository.findByIdAndUserId(addressId, userId);
    }

    @Override
    public UserAddress save(UserAddress address) {
        return repository.save(address);
    }

    @Override
    public void delete(UserAddress address) {
        repository.delete(address);
    }

    @Override
    public void resetDefaultAddress(Long userId) {
        repository.resetDefaultAddress(userId);
    }
}