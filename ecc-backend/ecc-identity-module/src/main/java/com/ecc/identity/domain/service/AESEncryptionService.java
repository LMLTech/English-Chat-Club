package com.ecc.identity.domain.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class AESEncryptionService {

    private static final String ALGORITHM = "AES";
    private final SecretKeySpec secretKey;

    // Inject chuỗi mã hóa tạm thời từ cấu hình (Yêu cầu độ dài đủ 32 ký tự để chạy AES-256)
    public AESEncryptionService(@Value("${app.security.aes-key:eccprojectsecuritykey202632bytes}") String secret) {
        byte[] keyBytes = secret.substring(0, 32).getBytes(StandardCharsets.UTF_8);
        this.secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
    }

    public String encrypt(String data) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encryptedBytes = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi trong quá trình mã hóa AES", e);
        }
    }

    public String decrypt(String encryptedData) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi trong quá trình giải mã AES", e);
        }
    }
}