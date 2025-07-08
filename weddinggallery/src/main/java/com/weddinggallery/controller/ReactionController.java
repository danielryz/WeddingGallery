package com.weddinggallery.controller;

import com.weddinggallery.dto.reaction.ReactionRequest;
import com.weddinggallery.model.Reaction;
import com.weddinggallery.service.ReactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Reactions", description = "Manage photo reactions")
public class ReactionController {

    private final ReactionService reactionService;

    @PostMapping("/photos/{photoId}/reactions")
    @Operation(summary = "Add reaction to photo")
    public Reaction addReaction(@PathVariable Long photoId,
                                @RequestBody ReactionRequest requestBody,
                                HttpServletRequest request) {
        return reactionService.addReaction(photoId, requestBody.getType(), request);
    }

    @DeleteMapping("/reactions/{id}")
    @Operation(summary = "Delete reaction")
    public void deleteReaction(@PathVariable Long id, HttpServletRequest request) {
        reactionService.deleteReaction(id, request);
    }
}
