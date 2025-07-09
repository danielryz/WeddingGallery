package com.weddinggallery.service;

import com.weddinggallery.model.Comment;
import com.weddinggallery.model.Photo;
import com.weddinggallery.model.Device;
import com.weddinggallery.dto.comment.CommentResponse;
import com.weddinggallery.repository.CommentRepository;
import com.weddinggallery.repository.PhotoRepository;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PhotoRepository photoRepository;
    private final DeviceRepository deviceRepository;
    private final JwtTokenProvider tokenProvider;

    public CommentResponse addComment(Long photoId, String text, HttpServletRequest request) {
        Device device = getRequestingDevice(request);
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new AccessDeniedException("Photo not found"));
        Comment comment = Comment.builder()
                .photo(photo)
                .author(device)
                .text(text)
                .createdAt(LocalDateTime.now())
                .build();
        Comment saved = commentRepository.save(comment);
        photo.setCommentCount(photo.getCommentCount() + 1);
        photoRepository.save(photo);
        return toResponse(saved);
    }

    public void deleteComment(Long id, HttpServletRequest request) {
        Device device = getRequestingDevice(request);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new AccessDeniedException("Comment not found"));

        if (!isAdmin && (comment.getAuthor() == null || !comment.getAuthor().getId().equals(device.getId()))) {
            throw new AccessDeniedException("Not authorized to delete this comment");
        }

        commentRepository.delete(comment);
        Photo photo = comment.getPhoto();
        photo.setCommentCount(Math.max(0, photo.getCommentCount() - 1));
        photoRepository.save(photo);
    }

    private CommentResponse toResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getText(),
                comment.getCreatedAt(),
                comment.getPhoto() != null ? comment.getPhoto().getId() : null,
                comment.getAuthor() != null ? comment.getAuthor().getId() : null
        );
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
