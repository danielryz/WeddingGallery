package com.weddinggallery.service;

import com.weddinggallery.model.Device;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceService {
    private final DeviceRepository deviceRepository;
    private final JwtTokenProvider tokenProvider;

    public Device getRequestingDevice(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AccessDeniedException("Missing token");
        }

        String headerClientId = request.getHeader("X-client-Id");
        if (headerClientId == null || headerClientId.isBlank()) {
            throw new AccessDeniedException("Missing client id header");
        }

        String token = authHeader.substring(7);
        String tokenClientId = tokenProvider.getClientIdFromToken(token);
        if (!headerClientId.equals(tokenClientId)) {
            throw new AccessDeniedException("Client id mismatch");
        }

        return deviceRepository.findByClientIdWithUser(UUID.fromString(tokenClientId))
                .orElseThrow(() -> new AccessDeniedException("Device not found"));
    }
}
