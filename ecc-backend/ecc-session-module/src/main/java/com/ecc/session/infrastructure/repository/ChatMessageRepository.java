package com.ecc.session.infrastructure.repository;

import com.ecc.session.domain.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    long countBySessionAndIsPinnedTrue(com.ecc.session.domain.model.Session session);

    List<ChatMessage> findTop50BySessionIdOrderByCreatedAtDesc(Long sessionId);
}