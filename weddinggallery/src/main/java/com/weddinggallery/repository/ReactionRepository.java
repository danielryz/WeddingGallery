package com.weddinggallery.repository;

import com.weddinggallery.model.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {
}
