package com.ecc.identity.application.port.in;

import com.ecc.identity.api.dto.request.AddressRequest;
import com.ecc.identity.api.dto.response.AddressResponse;
import java.util.List;

public interface UserAddressUseCase {
    AddressResponse addAddress(Long userId, AddressRequest request);
    List<AddressResponse> getUserAddresses(Long userId);
    AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request);
    void deleteAddress(Long userId, Long addressId);
}