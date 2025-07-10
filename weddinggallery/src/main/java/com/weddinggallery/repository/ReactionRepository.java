package com.weddinggallery.repository;

import com.weddinggallery.model.Reaction;
import com.weddinggallery.dto.reaction.ReactionCountResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    @Query("SELECT new com.weddinggallery.dto.reaction.ReactionCountResponse(r.type, COUNT(r)) " +
           "FROM Reaction r WHERE r.photo.id = :photoId GROUP BY r.type")
    List<ReactionCountResponse> countByPhotoIdGroupByType(@Param("photoId") Long photoId);

    Optional<Reaction> findByPhotoIdAndDeviceId(Long photoId, Long deviceId);
}

