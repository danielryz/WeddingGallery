package com.weddinggallery.service;

import com.weddinggallery.dto.chat.ChatMessageResponse;
import com.weddinggallery.model.ChatMessage;
import com.weddinggallery.model.Device;
import com.weddinggallery.repository.ChatMessageRepository;
import com.weddinggallery.service.DeviceService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final DeviceService deviceService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatMessageResponse sendMessage(String text, HttpServletRequest request) {
        Device device = deviceService.getRequestingDevice(request);
        ChatMessage message = ChatMessage.builder()
                .device(device)
                .text(text)
                .createdAt(LocalDateTime.now())
                .build();
        ChatMessage saved = chatMessageRepository.save(message);
        ChatMessageResponse response = toResponse(saved);
        messagingTemplate.convertAndSend("/topic/chat", response);
        return response;
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
                message.getDevice() != null ? message.getDevice().getId() : null,
                message.getDevice() != null ? message.getDevice().getName() : null
        );
    }

}
