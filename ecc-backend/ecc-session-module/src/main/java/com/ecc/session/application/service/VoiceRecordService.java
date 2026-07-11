package com.ecc.session.application.service;

import com.ecc.session.domain.model.Session;
import com.ecc.session.domain.model.UserVoiceRecord;
import com.ecc.session.application.port.out.SessionRepositoryPort;
import com.ecc.session.application.port.out.UserVoiceRecordRepositoryPort;
import com.ecc.session.application.port.in.ManageVoiceRecordUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VoiceRecordService implements ManageVoiceRecordUseCase {

    private final UserVoiceRecordRepositoryPort userVoiceRecordRepository;
    private final SessionRepositoryPort sessionRepository;

    // Cấu hình thư mục lưu file tạm thời ở Local (Sau này Phase 5 sẽ thay bằng AWS S3)
    @Value("${app.upload.voice-dir:uploads/voices/}")
    private String uploadDir;

    @Transactional
    public UserVoiceRecord saveVoiceRecord(Long userId, Long sessionId, MultipartFile file, Integer duration) throws IOException {

        Session session = null;
        if (sessionId != null) {
            session = sessionRepository.findById(sessionId).orElse(null);
        }

        // 1. Xử lý lưu file vật lý
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "audio.mp3");
        String fileExtension = "";
        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        // Tạo tên file duy nhất tránh trùng lặp
        String newFileName = "voice_" + userId + "_" + System.currentTimeMillis() + fileExtension;
        Path filePath = uploadPath.resolve(newFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Giả lập URL tải file (Thực tế sẽ cấu hình WebMvcConfigurer để map đường dẫn tĩnh)
        String fileUrl = "/files/voices/" + newFileName;

        // 2. Lưu thông tin vào Database
        UserVoiceRecord record = UserVoiceRecord.builder()
                .uuid(UUID.randomUUID())
                .userId(userId)
                .session(session)
                .audioUrl(fileUrl)
                .durationSeconds(duration)
                // Transcript có thể dùng Google Speech-To-Text API xử lý sau
                .transcript(null)
                .build();

        return userVoiceRecordRepository.save(record);
    }
}