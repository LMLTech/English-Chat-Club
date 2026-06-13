package com.ecc.identity.infrastructure.security;

import com.ecc.identity.domain.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.access-token-expiration}")
    private long accessTokenExpirationMinutes;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user, List<String> permissions) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (accessTokenExpirationMinutes * 60 * 1000));

        // Tạm thời mock ROLE và PERMISSION. Khi xong Role Module sẽ lấy từ user.getRoles()
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", "MEMBER") // Tạm fix cứng
                .claim("permissions", permissions)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String generateTemp2faToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (5 * 60 * 1000)); // 5 phút TTL

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("type", "2FA_TEMP")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }
}