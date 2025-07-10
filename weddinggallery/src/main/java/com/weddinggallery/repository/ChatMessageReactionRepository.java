package com.weddinggallery.repository;

import com.weddinggallery.model.ChatMessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageReactionRepository extends JpaRepository<ChatMessageReaction, Long> {
    List<ChatMessageReaction> findByMessageIdOrderByCreatedAt(Long messageId);
}
