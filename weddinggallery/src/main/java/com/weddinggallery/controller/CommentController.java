package com.weddinggallery.controller;

import com.weddinggallery.dto.comment.CommentRequest;
import com.weddinggallery.dto.comment.CommentResponse;
import com.weddinggallery.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
    @Operation(
            summary = "Add comment to photo",
            description = "Creates a comment for the specified photo and returns the created comment")
    @ApiResponse(responseCode = "200", description = "Comment added")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long photoId,
                              @RequestBody CommentRequest requestBody,
                              HttpServletRequest request) {
        CommentResponse response = commentService.addComment(photoId, requestBody.getText(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/comments/{id}")
    @Operation(summary = "Delete comment",
            description = "Deletes the comment if the requesting device is authorized")
    @ApiResponse(responseCode = "204", description = "Comment deleted")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, HttpServletRequest request) {
        commentService.deleteComment(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/admin/comments/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Admin delete comment",
            description = "Deletes the comment as an administrator")
    @ApiResponse(responseCode = "204", description = "Comment deleted")
    public ResponseEntity<Void> adminDeleteComment(@PathVariable Long id, HttpServletRequest request) {
        commentService.deleteComment(id, request);
        return ResponseEntity.noContent().build();
    }
}
