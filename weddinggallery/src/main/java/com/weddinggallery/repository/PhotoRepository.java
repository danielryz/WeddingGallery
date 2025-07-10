package com.weddinggallery.repository;

import com.weddinggallery.model.Photo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import java.util.Optional;

public interface PhotoRepository
        extends JpaRepository<Photo, Long>, JpaSpecificationExecutor<Photo> {

  Optional<Photo> findByIdAndDeviceId(@NonNull Long id, @NonNull Long deviceId);

  @Override
  @EntityGraph(attributePaths = {"uploader","device"})
  @NonNull
  Optional<Photo> findById(@NonNull Long id);

  @Override
  @EntityGraph(attributePaths = {"uploader", "device"})
  @NonNull
  Page<Photo> findAll(
          @Nullable Specification<Photo> spec,
          @NonNull Pageable pageable);
}
