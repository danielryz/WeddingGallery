package com.weddinggallery.controller;

import com.weddinggallery.dto.comment.CommentRequest;
import com.weddinggallery.dto.comment.CommentResponse;
import com.weddinggallery.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Manage photo comments")
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/photos/{photoId}/comments")
    @Operation(summary = "Add comment to photo")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long photoId,
                              @RequestBody CommentRequest requestBody,
                              HttpServletRequest request) {
        CommentResponse response = commentService.addComment(photoId, requestBody.getText(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/comments/{id}")
    @Operation(summary = "Delete comment")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, HttpServletRequest request) {
        commentService.deleteComment(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/admin/comments/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Admin delete comment")
    public ResponseEntity<Void> adminDeleteComment(@PathVariable Long id, HttpServletRequest request) {
        commentService.deleteComment(id, request);
        return ResponseEntity.noContent().build();
    }
}
