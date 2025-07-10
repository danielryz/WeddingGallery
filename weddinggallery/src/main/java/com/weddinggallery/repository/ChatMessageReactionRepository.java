package com.weddinggallery.repository;

import com.weddinggallery.model.ChatMessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageReactionRepository extends JpaRepository<ChatMessageReaction, Long> {
}
