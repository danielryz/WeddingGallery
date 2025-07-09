package com.weddinggallery.repository;

import com.weddinggallery.model.Device;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviceRepository extends JpaRepository<Device, Long> {
  Optional<Device> findByClientId(UUID clientId);

  @org.springframework.data.jpa.repository.Query(
      "select d from Device d join fetch d.user where d.clientId = :clientId")
  Optional<Device> findByClientIdWithUser(UUID clientId);
}

