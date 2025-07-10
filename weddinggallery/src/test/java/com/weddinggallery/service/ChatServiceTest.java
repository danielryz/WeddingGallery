package com.weddinggallery.service;

import com.weddinggallery.dto.chat.ChatMessageResponse;
import com.weddinggallery.model.ChatMessage;
import com.weddinggallery.model.Device;
import com.weddinggallery.model.User;
import com.weddinggallery.repository.ChatMessageRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;
    @Mock
    private DeviceService deviceService;
    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatService chatService;

    private Device device;

    @BeforeEach
    void setUp() {
        User user = User.builder()
                .id(1L)
                .username("john")
                .build();
        device = Device.builder()
                .id(2L)
                .clientId(UUID.randomUUID())
                .user(user)
                .build();
    }

    @Test
    void sendMessagePersistsAndBroadcasts() {
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(deviceService.getRequestingDevice(req)).thenReturn(device);
        ChatMessage saved = ChatMessage.builder()
                .id(3L)
                .device(device)
                .text("hello")
                .createdAt(LocalDateTime.now())
                .build();
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(saved);

        var response = chatService.sendMessage("hello", req);

        assertThat(response.getId()).isEqualTo(3L);
        assertThat(response.getText()).isEqualTo("hello");
        verify(chatMessageRepository).save(any(ChatMessage.class));
        verify(messagingTemplate).convertAndSend(
                eq("/topic/chat"),
                any(ChatMessageResponse.class)
        );
    }

    @Test
    void missingAuthorizationHeaderThrows() {
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(deviceService.getRequestingDevice(req)).thenThrow(new AccessDeniedException("Missing token"));

        assertThrows(AccessDeniedException.class, () -> chatService.sendMessage("hi", req));
    }

    @Test
    void clientIdMismatchThrows() {
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(deviceService.getRequestingDevice(req)).thenThrow(new AccessDeniedException("Client id mismatch"));

        assertThrows(AccessDeniedException.class, () -> chatService.sendMessage("hi", req));
    }
}
