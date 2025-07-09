package com.weddinggallery.service;

import com.weddinggallery.model.Device;
import com.weddinggallery.model.Photo;
import com.weddinggallery.model.User;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.repository.PhotoRepository;
import com.weddinggallery.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PhotoServiceTest {

    @Mock
    private PhotoRepository photoRepository;
    @Mock
    private DeviceRepository deviceRepository;
    @Mock
    private JwtTokenProvider tokenProvider;
    @Mock
    private StorageService storageService;

    @InjectMocks
    private PhotoService photoService;

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
    void savesPhotoWhenExtensionAllowed() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "img.jpg", "image/jpeg", new byte[0]);
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(req.getHeader("Authorization")).thenReturn("Bearer token");
        when(tokenProvider.getClientIdFromToken("token")).thenReturn(device.getClientId().toString());
        when(deviceRepository.findByClientIdWithUser(device.getClientId())).thenReturn(Optional.of(device));
        when(storageService.store(file)).thenReturn("stored.jpg");
        when(photoRepository.save(any(Photo.class))).thenAnswer(invocation -> {
            Photo p = invocation.getArgument(0);
            p.setId(3L);
            return p;
        });

        var response = photoService.savePhoto(file, null, req);

        assertThat(response.getFileName()).isEqualTo("stored.jpg");
        verify(storageService).store(file);
        verify(photoRepository).save(any(Photo.class));
    }

    @Test
    void rejectsUnsupportedExtension() {
        MockMultipartFile file = new MockMultipartFile("file", "doc.txt", "text/plain", new byte[0]);
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(req.getHeader("Authorization")).thenReturn("Bearer token");
        when(tokenProvider.getClientIdFromToken("token")).thenReturn(device.getClientId().toString());
        when(deviceRepository.findByClientIdWithUser(device.getClientId())).thenReturn(Optional.of(device));

        assertThrows(IllegalArgumentException.class, () -> photoService.savePhoto(file, null, req));

        verifyNoInteractions(storageService);
        verify(photoRepository, never()).save(any(Photo.class));
    }
}

