package com.ecc.identity.application.port.out;

import com.ecc.identity.domain.model.EmailVerificationToken;
import com.ecc.identity.domain.model.RefreshToken;
import java.util.Optional;

// Outbound Port cho việc lưu và truy xuất EmailVerificationToken
public interface TokenRepositoryPort {

    // Lưu token xác minh email
    EmailVerificationToken saveEmailToken(EmailVerificationToken token);

    // Tìm token theo tokenHash để phục vụ xác minh email
    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

    // Lưu Refresh Token
    RefreshToken saveRefreshToken(RefreshToken refreshToken);
}