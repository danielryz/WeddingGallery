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
    public ResponseEntity<CommentResponse> addComment(@RequestHeader(value = "X-client-Id", required = false) String clientId,
                              @PathVariable Long photoId,
                              @RequestBody CommentRequest requestBody,
                              HttpServletRequest request) {
        CommentResponse response = commentService.addComment(photoId, requestBody.getText(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/photos/{photoId}/comments")
    @Operation(summary = "Get comments for photo")
    public ResponseEntity<org.springframework.data.domain.Page<CommentResponse>> getComments(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @PathVariable Long photoId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest.of(page, size);
        var comments = commentService.getComments(photoId, pageRequest);
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/comments/{id}")
    @Operation(summary = "Delete comment",
            description = "Deletes the comment if the requesting device is authorized")
    @ApiResponse(responseCode = "204", description = "Comment deleted")
    public ResponseEntity<Void> deleteComment(@RequestHeader(value = "X-client-Id", required = false) String clientId,
                              @PathVariable Long id, HttpServletRequest request) {
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

