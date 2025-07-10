package com.weddinggallery.controller;

import com.weddinggallery.dto.chat.ChatMessageRequest;
import com.weddinggallery.dto.chat.ChatMessageResponse;
import com.weddinggallery.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Chat message operations")
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/messages")
    @Operation(summary = "Send chat message")
    @ApiResponse(responseCode = "200", description = "Message sent")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @RequestBody ChatMessageRequest request,
            HttpServletRequest httpRequest
    ) {
        ChatMessageResponse response = chatService.sendMessage(request.getText(), httpRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/messages")
    @Operation(summary = "Get chat messages")
    public ResponseEntity<Page<ChatMessageResponse>> getMessages(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<ChatMessageResponse> messages = chatService.getMessages(pageRequest);
        return ResponseEntity.ok(messages);
    }
}
