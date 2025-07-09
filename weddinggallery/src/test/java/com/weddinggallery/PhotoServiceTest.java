package com.weddinggallery;

import com.weddinggallery.model.Device;
import com.weddinggallery.model.Photo;
import com.weddinggallery.model.User;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.repository.PhotoRepository;
import com.weddinggallery.security.JwtTokenProvider;
import com.weddinggallery.service.PhotoService;
import com.weddinggallery.service.StorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
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
    void savesAllPhotosWhenExtensionsAllowed() throws Exception {
        MockMultipartFile file1 = new MockMultipartFile("files", "img1.jpg", "image/jpeg", new byte[0]);
        MockMultipartFile file2 = new MockMultipartFile("files", "video.mp4", "video/mp4", new byte[0]);
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(req.getHeader("Authorization")).thenReturn("Bearer token");
        when(req.getHeader("X-client-Id")).thenReturn(device.getClientId().toString());
        when(tokenProvider.getClientIdFromToken("token")).thenReturn(device.getClientId().toString());
        when(deviceRepository.findByClientIdWithUser(device.getClientId())).thenReturn(Optional.of(device));
        when(storageService.store(any(MultipartFile.class))).thenAnswer(inv -> ((MultipartFile) inv.getArgument(0)).getOriginalFilename());
        when(photoRepository.save(any(Photo.class))).thenAnswer(inv -> {
            Photo p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        var result = photoService.savePhotos(List.of(file1, file2), List.of("d1", "d2"), req);

        assertThat(result).hasSize(2);
        verify(storageService).store(file1);
        verify(storageService).store(file2);
        verify(photoRepository, times(2)).save(any(Photo.class));
    }

    @Test
    void unsupportedExtensionThrowsInSavePhotos() {
        MockMultipartFile file1 = new MockMultipartFile("files", "img1.jpg", "image/jpeg", new byte[0]);
        MockMultipartFile file2 = new MockMultipartFile("files", "doc.txt", "text/plain", new byte[0]);
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(req.getHeader("Authorization")).thenReturn("Bearer token");
        when(req.getHeader("X-client-Id")).thenReturn(device.getClientId().toString());
        when(tokenProvider.getClientIdFromToken("token")).thenReturn(device.getClientId().toString());
        when(deviceRepository.findByClientIdWithUser(device.getClientId())).thenReturn(Optional.of(device));

        assertThrows(IllegalArgumentException.class,
                () -> photoService.savePhotos(List.of(file1, file2), List.of("d1", "d2"), req));

        verifyNoInteractions(storageService);
        verify(photoRepository, never()).save(any(Photo.class));
    }
}
