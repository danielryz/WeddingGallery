package com.weddinggallery.controller;

import com.weddinggallery.dto.reaction.ReactionRequest;
import com.weddinggallery.dto.reaction.ReactionResponse;
import com.weddinggallery.service.ReactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
    @Operation(summary = "Add reaction to photo",
            description = "Adds a reaction to the specified photo and returns it")
    @ApiResponse(responseCode = "200", description = "Reaction added")
    public ResponseEntity<ReactionResponse> addReaction(@RequestHeader(value = "X-client-Id", required = false) String clientId,
                                @PathVariable Long photoId,
                                @RequestBody ReactionRequest requestBody,
                                HttpServletRequest request) {
        ReactionResponse response = reactionService.addReaction(photoId, requestBody.getType(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/reactions/{id}")
    @Operation(summary = "Delete reaction",
            description = "Deletes the reaction if the requesting device is authorized")
    @ApiResponse(responseCode = "204", description = "Reaction deleted")
    public ResponseEntity<Void> deleteReaction(@RequestHeader(value = "X-client-Id", required = false) String clientId,
                                @PathVariable Long id, HttpServletRequest request) {
        reactionService.deleteReaction(id, request);
        return ResponseEntity.noContent().build();
    }
}

