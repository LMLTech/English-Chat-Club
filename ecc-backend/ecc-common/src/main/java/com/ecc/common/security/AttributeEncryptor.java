package com.ecc.common.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Base64;

/**
 * JPA Converter tự động mã hóa AES khi lưu xuống DB và giải mã khi lấy lên.
 * Domain Layer không cần biết về sự tồn tại của class này.
 */
@Converter
@Component
public class AttributeEncryptor implements AttributeConverter<String, String> {

    private static final String AES = "AES";

    // Khai báo static vì JPA Converter do Hibernate khởi tạo, khó Inject trực tiếp
    private static String SECRET_KEY;

    // Lấy key 32 ký tự (256-bit) từ cấu hình. Có default key để code không bị crash khi test.
    @Value("${app.encryption.secret-key:EccSuperSecretKey123456789012345}")
    public void setSecretKey(String secretKey) {
        AttributeEncryptor.SECRET_KEY = secretKey;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        try {
            Key key = new SecretKeySpec(SECRET_KEY.getBytes(), AES);
            Cipher cipher = Cipher.getInstance(AES);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            return Base64.getEncoder().encodeToString(cipher.doFinal(attribute.getBytes()));
        } catch (Exception e) {
            throw new IllegalStateException("Lỗi mã hóa dữ liệu nhạy cảm", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            Key key = new SecretKeySpec(SECRET_KEY.getBytes(), AES);
            Cipher cipher = Cipher.getInstance(AES);
            cipher.init(Cipher.DECRYPT_MODE, key);
            return new String(cipher.doFinal(Base64.getDecoder().decode(dbData)));
        } catch (Exception e) {
            throw new IllegalStateException("Lỗi giải mã dữ liệu nhạy cảm", e);
        }
    }
}