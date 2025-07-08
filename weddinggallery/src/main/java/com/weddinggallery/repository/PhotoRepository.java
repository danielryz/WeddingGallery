package com.weddinggallery.repository;

import com.weddinggallery.model.Photo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PhotoRepository  extends JpaRepository<Photo, Long>, JpaSpecificationExecutor<Photo> {
    Optional<Photo> findByIdAndDeviceId(Long id, Long deviceId);
}
