package com.weddinggallery.repository;

import com.weddinggallery.model.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device,Long> {
    Optional<Device> findByClientId(UUID clientId);
}
