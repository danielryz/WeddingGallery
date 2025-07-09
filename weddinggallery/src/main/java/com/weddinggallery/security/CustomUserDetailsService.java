package com.weddinggallery.security;

import com.weddinggallery.model.Device;
import com.weddinggallery.model.User;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;

    @Override
    public UserDetails loadUserByUsername(String principal)
            throws UsernameNotFoundException {
        User user = userRepository.findByUsername(principal)
                .or(() -> findByDevice(principal))
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + principal));
        return UserPrincipal.from(user);
    }

    private Optional<User> findByDevice(String principal) {
        try {
            return deviceRepository.findByClientIdWithUser(UUID.fromString(principal))
                    .map(Device::getUser);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}

