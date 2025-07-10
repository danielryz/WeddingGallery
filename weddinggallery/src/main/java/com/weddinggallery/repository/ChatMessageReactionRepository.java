package com.weddinggallery.repository;

import com.weddinggallery.model.ChatMessageReaction;
import com.weddinggallery.dto.chat.ChatReactionCountResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatMessageReactionRepository extends JpaRepository<ChatMessageReaction, Long> {
    List<ChatMessageReaction> findByMessageIdOrderByCreatedAt(Long messageId);

    Optional<ChatMessageReaction> findByMessageIdAndDeviceId(Long messageId, Long deviceId);

    @Query("SELECT new com.weddinggallery.dto.chat.ChatReactionCountResponse(r.emoji, COUNT(r)) " +
           "FROM ChatMessageReaction r WHERE r.message.id = :messageId GROUP BY r.emoji")
    List<ChatReactionCountResponse> countByMessageIdGroupByEmoji(@Param("messageId") Long messageId);
}
