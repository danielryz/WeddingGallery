package com.weddinggallery.service;

import com.weddinggallery.model.Device;
import com.weddinggallery.model.Photo;
import com.weddinggallery.model.Reaction;
import com.weddinggallery.dto.reaction.ReactionResponse;
import com.weddinggallery.dto.reaction.ReactionCountResponse;
import com.weddinggallery.repository.PhotoRepository;
import com.weddinggallery.repository.ReactionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class ReactionService {
    private final ReactionRepository reactionRepository;
    private final PhotoRepository photoRepository;
    private final DeviceService deviceService;

    @Transactional
    public ReactionResponse addReaction(Long photoId, String type, HttpServletRequest request) {
        Device device = deviceService.getRequestingDevice(request);
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new AccessDeniedException("Photo not found"));
        Reaction reaction = Reaction.builder()
                .photo(photo)
                .device(device)
                .type(type)
                .build();
        Reaction saved = reactionRepository.save(reaction);
        photo.setReactionCount(photo.getReactionCount() + 1);
        photoRepository.save(photo);
        return toResponse(saved);
    }

    @Transactional
    public void deleteReaction(Long id, HttpServletRequest request) {
        Device device = deviceService.getRequestingDevice(request);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        Reaction reaction = reactionRepository.findById(id)
                .orElseThrow(() -> new AccessDeniedException("Reaction not found"));

        if (!isAdmin && !reaction.getDevice().getId().equals(device.getId())) {
            throw new AccessDeniedException("Not authorized to delete this reaction");
        }

        reactionRepository.delete(reaction);
        Photo photo = reaction.getPhoto();
        photo.setReactionCount(Math.max(0, photo.getReactionCount() - 1));
        photoRepository.save(photo);
    }

    @Transactional
    public java.util.List<ReactionCountResponse> getReactionSummary(Long photoId) {
        return reactionRepository.countByPhotoIdGroupByType(photoId);
    }

    private ReactionResponse toResponse(Reaction reaction) {
        return new ReactionResponse(
                reaction.getId(),
                reaction.getType(),
                reaction.getPhoto() != null ? reaction.getPhoto().getId() : null,
                reaction.getDevice() != null ? reaction.getDevice().getId() : null,
                reaction.getDevice() != null ? reaction.getDevice().getName() : null
        );
    }

}

