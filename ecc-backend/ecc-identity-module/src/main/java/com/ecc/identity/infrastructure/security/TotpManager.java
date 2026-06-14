package com.ecc.identity.infrastructure.security;

import org.springframework.stereotype.Component;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

@Component
public class TotpManager {

    private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    // 1. Sinh ngẫu nhiên Secret Key dạng Base32 (Dài 16 ký tự)
    public String generateSecretKey() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[10];
        random.nextBytes(bytes);
        return encodeBase32(bytes);
    }

    // 2. Tạo URL để sinh mã QR Code hiển thị trên Frontend
    public String getQrCodeUrl(String secretKey, String accountEmail) {
        String issuer = "EnglishChatClub";
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                issuer, accountEmail, secretKey, issuer);
    }

    // Biến chuỗi URL thành ảnh QR Code dạng Base64
    public String getQrCodeImageBase64(String qrCodeUrl) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            // Kích thước QR Code là 200x200 pixel
            BitMatrix bitMatrix = qrCodeWriter.encode(qrCodeUrl, BarcodeFormat.QR_CODE, 200, 200);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            byte[] pngData = outputStream.toByteArray();

            // Trả về định dạng chuẩn để thẻ <img> của HTML đọc được trực tiếp
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo hình ảnh QR Code", e);
        }
    }

    // 3. Xác thực mã 6 số do người dùng nhập vào
    public boolean verifyCode(String secretKey, String codeStr) {
        if (codeStr == null || codeStr.length() != 6) return false;
        try {
            int code = Integer.parseInt(codeStr);
            byte[] decodedKey = decodeBase32(secretKey);
            long currentTimeWindow = System.currentTimeMillis() / 1000L / 30L;

            // Kiểm tra khớp trong cửa sổ thời gian (Cho phép lệch trước/sau 1 block 30s để bù độ trễ mạng)
            for (int i = -1; i <= 1; i++) {
                if (calculateTotp(decodedKey, currentTimeWindow + i) == code) {
                    return true;
                }
            }
        } catch (Exception e) {
            return false;
        }
        return false;
    }

    // Sinh mã TOTP theo thuật toán HMAC-SHA1
    private int calculateTotp(byte[] key, long time) throws NoSuchAlgorithmException, InvalidKeyException {
        byte[] data = ByteBuffer.allocate(8).putLong(time).array();
        SecretKeySpec signKey = new SecretKeySpec(key, "HmacSHA1");
        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(signKey);
        byte[] hash = mac.doFinal(data);

        int offset = hash[hash.length - 1] & 0xF;
        int binary = ((hash[offset] & 0x7F) << 24) |
                ((hash[offset + 1] & 0xFF) << 16) |
                ((hash[offset + 2] & 0xFF) << 8) |
                (hash[offset + 3] & 0xFF);

        // Trả về OTP 6 chữ số
        return binary % 1000000;
    }

    // Mã hóa byte[] thành chuỗi Base32
    private String encodeBase32(byte[] bytes) {
        StringBuilder sb = new StringBuilder((bytes.length * 8 + 4) / 5);
        int val = 0, count = 0;
        for (byte b : bytes) {
            val = (val << 8) | (b & 0xFF);
            count += 8;
            while (count >= 5) {
                sb.append(BASE32_CHARS.charAt((val >> (count - 5)) & 31));
                count -= 5;
            }
        }
        if (count > 0) {
            sb.append(BASE32_CHARS.charAt((val << (5 - count)) & 31));
        }
        return sb.toString();
    }

    // Giải mã Base32 thành byte[]
    private byte[] decodeBase32(String base32) {
        base32 = base32.toUpperCase().replaceAll("[=]", "");
        byte[] bytes = new byte[base32.length() * 5 / 8];
        int val = 0, count = 0, index = 0;
        for (int i = 0; i < base32.length(); i++) {
            int charVal = BASE32_CHARS.indexOf(base32.charAt(i));
            if (charVal < 0) throw new IllegalArgumentException("Invalid Base32 character");
            val = (val << 5) | charVal;
            count += 5;
            if (count >= 8) {
                bytes[index++] = (byte) ((val >> (count - 8)) & 0xFF);
                count -= 8;
            }
        }
        return bytes;
    }
}