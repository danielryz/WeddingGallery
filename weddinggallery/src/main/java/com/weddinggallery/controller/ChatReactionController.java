package com.weddinggallery.controller;

import com.weddinggallery.dto.chat.ChatReactionRequest;
import com.weddinggallery.dto.chat.ChatReactionResponse;
import com.weddinggallery.service.ChatReactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat Reactions", description = "Manage chat message reactions")
public class ChatReactionController {

    private final ChatReactionService chatReactionService;

    @PostMapping("/messages/{messageId}/reactions")
    @Operation(summary = "Add reaction to chat message")
    @ApiResponse(responseCode = "200", description = "Reaction added")
    public ResponseEntity<ChatReactionResponse> addReaction(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @PathVariable Long messageId,
            @RequestBody ChatReactionRequest requestBody,
            HttpServletRequest request) {
        ChatReactionResponse response = chatReactionService.addReaction(messageId, requestBody.getEmoji(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/messages/{messageId}/reactions")
    @Operation(summary = "Get reactions for chat message")
    public ResponseEntity<List<ChatReactionResponse>> getReactions(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @PathVariable Long messageId) {
        var responses = chatReactionService.getReactions(messageId);
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/reactions/{id}")
    @Operation(summary = "Delete chat reaction")
    @ApiResponse(responseCode = "204", description = "Reaction deleted")
    public ResponseEntity<Void> deleteReaction(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @PathVariable Long id,
            HttpServletRequest request) {
        chatReactionService.deleteReaction(id, request);
        return ResponseEntity.noContent().build();
    }
}
