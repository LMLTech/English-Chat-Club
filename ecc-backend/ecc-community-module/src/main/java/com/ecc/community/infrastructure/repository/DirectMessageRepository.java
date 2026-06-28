package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.DirectMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {

    @Query("SELECT m FROM DirectMessage m WHERE " +
           "(m.senderId = :userId AND m.receiverId = :friendId) OR " +
           "(m.senderId = :friendId AND m.receiverId = :userId) " +
           "ORDER BY m.createdAt DESC")
    Page<DirectMessage> findConversationHistory(@Param("userId") Long userId, @Param("friendId") Long friendId, Pageable pageable);
}
