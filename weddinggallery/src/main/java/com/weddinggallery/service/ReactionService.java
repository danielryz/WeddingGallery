package com.weddinggallery.service;

import com.weddinggallery.model.Device;
import com.weddinggallery.model.Photo;
import com.weddinggallery.model.Reaction;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.repository.PhotoRepository;
import com.weddinggallery.repository.ReactionRepository;
import com.weddinggallery.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReactionService {
    private final ReactionRepository reactionRepository;
    private final PhotoRepository photoRepository;
    private final DeviceRepository deviceRepository;
    private final JwtTokenProvider tokenProvider;

    public Reaction addReaction(Long photoId, String type, HttpServletRequest request) {
        Device device = getRequestingDevice(request);
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new AccessDeniedException("Photo not found"));
        Reaction reaction = Reaction.builder()
                .photo(photo)
                .device(device)
                .type(type)
                .build();
        return reactionRepository.save(reaction);
    }

    public void deleteReaction(Long id, HttpServletRequest request) {
        Device device = getRequestingDevice(request);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        Reaction reaction = reactionRepository.findById(id)
                .orElseThrow(() -> new AccessDeniedException("Reaction not found"));

        if (!isAdmin && !reaction.getDevice().getId().equals(device.getId())) {
            throw new AccessDeniedException("Not authorized to delete this reaction");
        }

        reactionRepository.delete(reaction);
    }

    private Device getRequestingDevice(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new AccessDeniedException("Missing token");
        }
        String token = header.substring(7);
        String clientId = tokenProvider.getClientIdFromToken(token);
        return deviceRepository.findByClientId(java.util.UUID.fromString(clientId))
                .orElseThrow(() -> new AccessDeniedException("Device not found"));
    }
}
