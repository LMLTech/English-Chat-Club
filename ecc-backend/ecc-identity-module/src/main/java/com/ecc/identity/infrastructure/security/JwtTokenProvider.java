package com.ecc.identity.infrastructure.security;

import com.ecc.identity.domain.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.access-token-expiration}")
    private long accessTokenExpirationMinutes;

    // Có thể cấu hình trong application.yml, nếu không mặc định 7 ngày (10080 phút)
    @Value("${app.jwt.refresh-token-expiration:10080}")
    private long refreshTokenExpirationMinutes;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // --- 1. CÁC HÀM TẠO TOKEN ---

    public String generateAccessToken(User user, List<String> permissions) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (accessTokenExpirationMinutes * 60 * 1000));

        // Tạm thời mock ROLE và PERMISSION. Khi xong Role Module sẽ lấy từ user.getRoles()
        return Jwts.builder()
                .id(UUID.randomUUID().toString()) // THÊM JTI: Bắt buộc để đưa vào Blacklist
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .claim("permissions", permissions)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    // Overload hàm này để dùng trong RefreshTokenService (khi chỉ có User)
    public String generateAccessToken(User user) {
        return generateAccessToken(user, List.of());
    }

    // Thêm hàm tạo Refresh Token
    public String generateRefreshToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (refreshTokenExpirationMinutes * 60 * 1000));

        return Jwts.builder()
                .id(UUID.randomUUID().toString()) // Tạo JWT ID duy nhất cho Refresh Token
                .subject(user.getId().toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String generateTemp2faToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (5 * 60 * 1000)); // 5 phút TTL

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(user.getId().toString())
                .claim("type", "2FA_TEMP")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    // --- 2. CÁC HÀM XÁC THỰC VÀ TIỆN ÍCH ---

    // Validate Token (Được gọi trong RefreshTokenService)
    public boolean validateToken(String token) {
        try {
            Jwts.parser() // Bản mới đổi từ parserBuilder() thành parser()
                    .verifyWith(getSigningKey()) // Bản mới dùng verifyWith thay cho setSigningKey
                    .build()
                    .parseSignedClaims(token); // Bản mới dùng parseSignedClaims
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Lấy JTI (JWT ID) từ claims của token
    public String getJtiFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload(); // Bản mới dùng getPayload() thay cho getBody()
        return claims.getId();
    }

    // Tính toán thời gian hết hạn còn lại (tính bằng giây) để set TTL cho Redis
    public long getRemainingTimeInSeconds(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Date expiration = claims.getExpiration();
            long diff = expiration.getTime() - System.currentTimeMillis();
            return diff > 0 ? diff / 1000 : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    // Hàm băm SHA-256 dùng để mã hóa Refresh Token trước khi lưu DB
    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi mã hóa token", e);
        }
    }
}