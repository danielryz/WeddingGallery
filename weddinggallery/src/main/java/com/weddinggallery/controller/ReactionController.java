package com.weddinggallery.controller;

import com.weddinggallery.dto.reaction.ReactionRequest;
import com.weddinggallery.dto.reaction.ReactionResponse;
import com.weddinggallery.service.ReactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Reactions", description = "Manage photo reactions")
public class ReactionController {

    private final ReactionService reactionService;

    @PostMapping("/photos/{photoId}/reactions")
    @Operation(summary = "Add reaction to photo")
    public ResponseEntity<ReactionResponse> addReaction(@PathVariable Long photoId,
                                @RequestBody ReactionRequest requestBody,
                                HttpServletRequest request) {
        ReactionResponse response = reactionService.addReaction(photoId, requestBody.getType(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/reactions/{id}")
    @Operation(summary = "Delete reaction")
    public ResponseEntity<Void> deleteReaction(@PathVariable Long id, HttpServletRequest request) {
        reactionService.deleteReaction(id, request);
        return ResponseEntity.noContent().build();
    }
}
