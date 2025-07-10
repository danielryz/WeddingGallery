package com.weddinggallery.service;

import com.weddinggallery.model.Device;
import com.weddinggallery.model.Photo;
import com.weddinggallery.model.Reaction;
import com.weddinggallery.repository.PhotoRepository;
import com.weddinggallery.repository.ReactionRepository;
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

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReactionServiceTest {

    @Mock
    private ReactionRepository reactionRepository;
    @Mock
    private PhotoRepository photoRepository;
    @Mock
    private DeviceService deviceService;

    @InjectMocks
    private ReactionService reactionService;

    private Device adminDevice;
    private Reaction reaction;

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
        reaction = Reaction.builder()
                .id(3L)
                .photo(Photo.builder().id(5L).build())
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

        reactionService.deleteReaction(3L, req);

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
                () -> reactionService.deleteReaction(3L, req));
        verify(reactionRepository, never()).delete(any());
        SecurityContextHolder.clearContext();
    }

    @Test
    void addReactionUpdatesExisting() {
        HttpServletRequest req = mock(HttpServletRequest.class);
        Photo photo = Photo.builder().id(5L).reactionCount(2).build();
        Reaction existing = Reaction.builder()
                .id(10L)
                .photo(photo)
                .device(adminDevice)
                .type("like")
                .build();

        when(deviceService.getRequestingDevice(req)).thenReturn(adminDevice);
        when(photoRepository.findById(5L)).thenReturn(Optional.of(photo));
        when(reactionRepository.findByPhotoIdAndDeviceId(5L, 1L)).thenReturn(Optional.of(existing));
        when(reactionRepository.save(existing)).thenReturn(existing);

        reactionService.addReaction(5L, "heart", req);

        verify(reactionRepository).save(existing);
        verify(photoRepository, never()).save(any());
        org.assertj.core.api.Assertions.assertThat(existing.getType()).isEqualTo("heart");
    }
}
