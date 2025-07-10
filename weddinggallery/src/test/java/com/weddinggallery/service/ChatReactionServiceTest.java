package com.weddinggallery.service;

import com.weddinggallery.model.ChatMessage;
import com.weddinggallery.model.ChatMessageReaction;
import com.weddinggallery.model.Device;
import com.weddinggallery.repository.ChatMessageReactionRepository;
import com.weddinggallery.repository.ChatMessageRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatReactionServiceTest {

    @Mock
    private ChatMessageReactionRepository reactionRepository;
    @Mock
    private ChatMessageRepository messageRepository;
    @Mock
    private DeviceService deviceService;

    @InjectMocks
    private ChatReactionService chatReactionService;

    private Device adminDevice;
    private ChatMessageReaction reaction;

    @BeforeEach
    void setUp() {
        adminDevice = Device.builder()
                .id(1L)
                .clientId(UUID.randomUUID())
                .build();
        Device ownerDevice = Device.builder()
                .id(2L)
                .clientId(UUID.randomUUID())
                .build();
        reaction = ChatMessageReaction.builder()
                .id(3L)
                .message(ChatMessage.builder().id(5L).build())
                .device(ownerDevice)
                .build();
    }

    @Test
    void adminCanDeleteOthersReaction() {
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(deviceService.getRequestingDevice(req)).thenReturn(adminDevice);
        when(reactionRepository.findById(3L)).thenReturn(Optional.of(reaction));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", "pass",
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));

        chatReactionService.deleteReaction(3L, req);

        verify(reactionRepository).delete(reaction);
        SecurityContextHolder.clearContext();
    }

    @Test
    void userCannotDeleteOthersReaction() {
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(deviceService.getRequestingDevice(req)).thenReturn(adminDevice);
        when(reactionRepository.findById(3L)).thenReturn(Optional.of(reaction));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user", "pass",
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))));

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> chatReactionService.deleteReaction(3L, req));
        verify(reactionRepository, never()).delete(any());
        SecurityContextHolder.clearContext();
    }

    @Test
    void getReactionsReturnsMappedResponses() {
        ChatMessageReaction r1 = ChatMessageReaction.builder()
                .id(10L)
                .emoji(":)")
                .message(ChatMessage.builder().id(5L).build())
                .device(adminDevice)
                .build();
        ChatMessageReaction r2 = ChatMessageReaction.builder()
                .id(11L)
                .emoji("(")
                .message(ChatMessage.builder().id(5L).build())
                .device(adminDevice)
                .build();
        when(reactionRepository.findByMessageIdOrderByCreatedAt(5L))
                .thenReturn(List.of(r1, r2));

        var responses = chatReactionService.getReactions(5L);

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).getId()).isEqualTo(10L);
        verify(reactionRepository).findByMessageIdOrderByCreatedAt(5L);
    }

    @Test
    void addReactionUpdatesExisting() {
        HttpServletRequest req = mock(HttpServletRequest.class);
        ChatMessage message = ChatMessage.builder().id(5L).build();
        ChatMessageReaction existing = ChatMessageReaction.builder()
                .id(7L)
                .message(message)
                .device(adminDevice)
                .emoji("a")
                .build();

        when(deviceService.getRequestingDevice(req)).thenReturn(adminDevice);
        when(messageRepository.findById(5L)).thenReturn(Optional.of(message));
        when(reactionRepository.findByMessageIdAndDeviceId(5L, 1L)).thenReturn(Optional.of(existing));
        when(reactionRepository.save(existing)).thenReturn(existing);

        chatReactionService.addReaction(5L, "b", req);

        verify(reactionRepository).save(existing);
        assertThat(existing.getEmoji()).isEqualTo("b");
    }
}
