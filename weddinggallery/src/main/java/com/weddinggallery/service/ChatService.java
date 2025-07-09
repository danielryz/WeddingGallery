package com.weddinggallery.service;

import com.weddinggallery.dto.chat.ChatMessageResponse;
import com.weddinggallery.model.ChatMessage;
import com.weddinggallery.model.Device;
import com.weddinggallery.repository.ChatMessageRepository;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final DeviceRepository deviceRepository;
    private final JwtTokenProvider tokenProvider;

    public ChatMessageResponse sendMessage(String text, HttpServletRequest request) {
        Device device = getRequestingDevice(request);
        ChatMessage message = ChatMessage.builder()
                .device(device)
                .text(text)
                .createdAt(LocalDateTime.now())
                .build();
        ChatMessage saved = chatMessageRepository.save(message);
        return toResponse(saved);
    }

    public Page<ChatMessageResponse> getMessages(Pageable pageable) {
        PageRequest pageRequest = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.ASC, "createdAt")
        );
        return chatMessageRepository.findAll(pageRequest)
                .map(this::toResponse);
    }

    private ChatMessageResponse toResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getDevice() != null && message.getDevice().getUser() != null
                        ? message.getDevice().getUser().getUsername()
                        : null,
                message.getText(),
                message.getCreatedAt(),
                message.getDevice() != null ? message.getDevice().getId() : null
        );
    }

    private Device getRequestingDevice(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AccessDeniedException("Missing token");
        }

        String headerClientId = request.getHeader("X-client-Id");
        if (headerClientId == null || headerClientId.isBlank()) {
            throw new AccessDeniedException("Missing client id header");
        }

        String token = authHeader.substring(7);
        String tokenClientId = tokenProvider.getClientIdFromToken(token);
        if (!headerClientId.equals(tokenClientId)) {
            throw new AccessDeniedException("Client id mismatch");
        }

        return deviceRepository.findByClientIdWithUser(UUID.fromString(tokenClientId))
                .orElseThrow(() -> new AccessDeniedException("Device not found"));
    }
}
