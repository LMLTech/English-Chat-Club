package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.UserVoiceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserVoiceRecordRepository extends JpaRepository<UserVoiceRecord, Long> {
}