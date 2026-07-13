package com.ecc.identity.application.port.in;

import com.ecc.identity.api.dto.response.UserProfileResponse;
import java.util.List;

public interface ManageUserUseCase {
    List<UserProfileResponse> getAllUsers();
}
