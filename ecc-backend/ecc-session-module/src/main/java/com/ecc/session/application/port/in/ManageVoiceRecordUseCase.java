package com.ecc.session.application.port.in;

import com.ecc.session.domain.model.UserVoiceRecord;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface ManageVoiceRecordUseCase {
    UserVoiceRecord saveVoiceRecord(Long userId, Long sessionId, MultipartFile file, Integer duration) throws IOException;
}
