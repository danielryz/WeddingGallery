package com.weddinggallery.repository;

import com.weddinggallery.model.Photo;

import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PhotoRepository  extends JpaRepository<Photo, Long>, JpaSpecificationExecutor<Photo> {
    Optional<Photo> findByIdAndDeviceId(Long id, Long deviceId);

    @Override
    @EntityGraph(attributePaths = {"uploader", "device"})
    org.springframework.data.domain.Page<Photo> findAll(org.springframework.data.jpa.domain.Specification<Photo> spec,
                                                       org.springframework.data.domain.Pageable pageable);
}
