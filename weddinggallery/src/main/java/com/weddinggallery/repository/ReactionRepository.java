package com.weddinggallery.repository;

import com.weddinggallery.model.Reaction;
import com.weddinggallery.dto.reaction.ReactionCountResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    @Query("SELECT new com.weddinggallery.dto.reaction.ReactionCountResponse(r.type, COUNT(r)) " +
           "FROM Reaction r WHERE r.photo.id = :photoId GROUP BY r.type")
    java.util.List<ReactionCountResponse> countByPhotoIdGroupByType(@Param("photoId") Long photoId);
}

