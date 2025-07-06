package com.weddinggallery.repository;

import aj.org.objectweb.asm.commons.InstructionAdapter;
import com.weddinggallery.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByClientId(String clientId);
    Optional<User> findByUsername(String username);
}