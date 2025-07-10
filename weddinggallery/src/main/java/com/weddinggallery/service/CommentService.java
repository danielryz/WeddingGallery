package com.weddinggallery.service;

import com.weddinggallery.model.Comment;
import com.weddinggallery.model.Photo;
import com.weddinggallery.model.Device;
import com.weddinggallery.dto.comment.CommentResponse;
import com.weddinggallery.repository.CommentRepository;
import com.weddinggallery.repository.PhotoRepository;
import com.weddinggallery.service.DeviceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PhotoRepository photoRepository;
    private final DeviceService deviceService;

    @Transactional
    public CommentResponse addComment(Long photoId, String text, HttpServletRequest request) {
        Device device = deviceService.getRequestingDevice(request);
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

    @Transactional
    public void deleteComment(Long id, HttpServletRequest request) {
        Device device = deviceService.getRequestingDevice(request);
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
                comment.getAuthor() != null ? comment.getAuthor().getId() : null,
                comment.getAuthor() != null ? comment.getAuthor().getName() : null
        );
    }

}

