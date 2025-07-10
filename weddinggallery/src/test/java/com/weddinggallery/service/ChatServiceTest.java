package com.weddinggallery.service;

import com.weddinggallery.model.ChatMessage;
import com.weddinggallery.model.Device;
import com.weddinggallery.model.User;
import com.weddinggallery.repository.ChatMessageRepository;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.security.JwtTokenProvider;
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
import java.util.Optional;
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
    private DeviceRepository deviceRepository;
    @Mock
    private JwtTokenProvider tokenProvider;
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
        when(req.getHeader("Authorization")).thenReturn("Bearer token");
        when(req.getHeader("X-client-Id")).thenReturn(device.getClientId().toString());
        when(tokenProvider.getClientIdFromToken("token")).thenReturn(device.getClientId().toString());
        when(deviceRepository.findByClientIdWithUser(device.getClientId())).thenReturn(Optional.of(device));
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
        verify(messagingTemplate).convertAndSend(eq("/topic/chat"), any());
    }

    @Test
    void missingAuthorizationHeaderThrows() {
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(req.getHeader("Authorization")).thenReturn(null);

        assertThrows(AccessDeniedException.class, () -> chatService.sendMessage("hi", req));
    }

    @Test
    void clientIdMismatchThrows() {
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(req.getHeader("Authorization")).thenReturn("Bearer token");
        when(req.getHeader("X-client-Id")).thenReturn("other");
        when(tokenProvider.getClientIdFromToken("token")).thenReturn(device.getClientId().toString());

        assertThrows(AccessDeniedException.class, () -> chatService.sendMessage("hi", req));
    }
}
