package com.weddinggallery.auth;

import com.weddinggallery.dto.auth.AuthResponse;
import com.weddinggallery.dto.auth.LoginRequest;
import com.weddinggallery.dto.auth.RegisterRequest;
import com.weddinggallery.model.Device;
import com.weddinggallery.model.Role;
import com.weddinggallery.model.User;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.repository.RoleRepository;
import com.weddinggallery.repository.UserRepository;
import com.weddinggallery.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final DeviceRepository deviceRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse login(LoginRequest req, String clientId, HttpServletRequest httpReq) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        Device device;

        UUID providedId = Optional.ofNullable(clientId)
                .filter(s -> !s.isBlank())
                .map(UUID::fromString)
                .orElse(null);

        if (providedId != null) {
            device = deviceRepository.findByClientId(providedId)
                    .map(d -> {
                        if (req.getName() != null) {
                            d.setName(req.getName());
                        }
                        d.setDeviceInfo(httpReq.getHeader("User-Agent"));
                        return deviceRepository.save(d);
                    })
                    .orElseGet(() -> {
                        User shared = userRepository.findByUsername(req.getUsername())
                                .orElseThrow(() -> new UsernameNotFoundException("Brak konta: " + req.getUsername()));
                        Device d = Device.builder()
                                .clientId(providedId)
                                .user(shared)
                                .name(req.getName())
                                .deviceInfo(httpReq.getHeader("User-Agent"))
                                .createdAt(LocalDateTime.now())
                                .build();
                        return deviceRepository.save(d);
                    });
        } else {
            User shared = userRepository.findByUsername(req.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("Brak konta: " + req.getUsername()));
            device = Device.builder()
                    .clientId(UUID.randomUUID())
                    .user(shared)
                    .name(req.getName())
                    .deviceInfo(httpReq.getHeader("User-Agent"))
                    .createdAt(LocalDateTime.now())
                    .build();
            device = deviceRepository.save(device);
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new IllegalStateException("Brak roli ROLE_USER"));

        String token = jwtTokenProvider.createToken(
                device.getClientId().toString(),
                Collections.singleton(userRole)
        );
        return new AuthResponse(device.getClientId().toString(), token);
    }

    @Transactional
    public void registerUser(RegisterRequest req) {
        createAccount(req, false);
    }

    @Transactional
    public void registerAdmin(RegisterRequest req) {
        createAccount(req, true);
    }

    private void createAccount(RegisterRequest req, boolean admin) {
        if (userRepository.findByUsername(req.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new IllegalStateException("Brak roli ROLE_USER"));

        java.util.Set<Role> roles = new java.util.HashSet<>();
        roles.add(userRole);

        if (admin) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new IllegalStateException("Brak roli ROLE_ADMIN"));
            roles.add(adminRole);
        }

        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .roles(roles)
                .build();

        userRepository.save(user);
    }
}

