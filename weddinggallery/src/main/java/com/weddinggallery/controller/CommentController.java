package com.weddinggallery.controller;

import com.weddinggallery.dto.comment.CommentRequest;
import com.weddinggallery.model.Comment;
import com.weddinggallery.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Manage photo comments")
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/photos/{photoId}/comments")
    @Operation(summary = "Add comment to photo")
    public Comment addComment(@PathVariable Long photoId,
                              @RequestBody CommentRequest requestBody,
                              HttpServletRequest request) {
        return commentService.addComment(photoId, requestBody.getText(), request);
    }

    @DeleteMapping("/comments/{id}")
    @Operation(summary = "Delete comment")
    public void deleteComment(@PathVariable Long id, HttpServletRequest request) {
        commentService.deleteComment(id, request);
    }
}
