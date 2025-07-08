package com.weddinggallery.auth;

import com.weddinggallery.dto.auth.AuthResponse;
import com.weddinggallery.dto.auth.LoginRequest;
import com.weddinggallery.model.Device;
import com.weddinggallery.model.Role;
import com.weddinggallery.model.User;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.repository.RoleRepository;
import com.weddinggallery.repository.UserRepository;
import com.weddinggallery.security.JwtTokenProvider;
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

    @Transactional
    public AuthResponse login(LoginRequest req, HttpServletRequest httpReq) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );


        String headerClientId = httpReq.getHeader("X-ClientId");

        Device device = Optional.ofNullable(headerClientId)
                .flatMap(id -> deviceRepository.findByClientId(UUID.fromString(id)))
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
                            .clientId(UUID.randomUUID())
                            .user(shared)
                            .name(req.getName())
                            .deviceInfo(httpReq.getHeader("User-Agent"))
                            .createdAt(LocalDateTime.now())
                            .build();
                    return deviceRepository.save(d);
                });

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new IllegalStateException("Brak roli ROLE_USER"));

        String token = jwtTokenProvider.createToken(
                device.getClientId().toString(),
                Collections.singleton(userRole)
        );
        return new AuthResponse(device.getClientId().toString(), token);
    }
}
