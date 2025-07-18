package com.weddinggallery.service;

import com.weddinggallery.model.Device;
import com.weddinggallery.model.Photo;
import com.weddinggallery.model.User;
import com.weddinggallery.repository.PhotoRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
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
    private DeviceService deviceService;
    @Mock
    private UploadQueueService uploadQueueService;

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
        MockMultipartFile file = new MockMultipartFile("file", "video.mp4", "video/mp4", new byte[0]);
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(deviceService.getRequestingDevice(req)).thenReturn(device);
        photoService.savePhoto(file, null, true, req);

        verify(uploadQueueService).submitUpload(any(Runnable.class));
        verifyNoInteractions(photoRepository);
    }

    @Test
    void rejectsUnsupportedExtension() {
        MockMultipartFile file = new MockMultipartFile("file", "doc.txt", "text/plain", new byte[0]);
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(deviceService.getRequestingDevice(req)).thenReturn(device);

        assertThrows(IllegalArgumentException.class, () -> photoService.savePhoto(file, null, true, req));

        verifyNoInteractions(uploadQueueService);
    }

    @Test
    void missingAuthorizationHeaderThrows() {
        MockMultipartFile file = new MockMultipartFile("file", "img.jpg", "image/jpeg", new byte[0]);
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(deviceService.getRequestingDevice(req)).thenThrow(new AccessDeniedException("Missing token"));

        assertThrows(AccessDeniedException.class, () -> photoService.savePhoto(file, null, true, req));
    }

    @Test
    void missingClientIdHeaderThrows() {
        MockMultipartFile file = new MockMultipartFile("file", "img.jpg", "image/jpeg", new byte[0]);
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(deviceService.getRequestingDevice(req)).thenThrow(new AccessDeniedException("Missing client id header"));

        assertThrows(AccessDeniedException.class, () -> photoService.savePhoto(file, null, true, req));
    }

    @Test
    void clientIdMismatchThrows() {
        MockMultipartFile file = new MockMultipartFile("file", "img.jpg", "image/jpeg", new byte[0]);
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(deviceService.getRequestingDevice(req)).thenThrow(new AccessDeniedException("Client id mismatch"));

        assertThrows(AccessDeniedException.class, () -> photoService.savePhoto(file, null, true, req));
    }

    @Test
    void getPhotoReturnsMappedResponse() {
        Photo photo = Photo.builder()
                .id(5L)
                .fileName("img.jpg")
                .description("desc")
                .uploadTime(LocalDateTime.now())
                .commentCount(1)
                .reactionCount(2)
                .uploader(device.getUser())
                .device(device)
                .visible(true)
                .build();
        when(photoRepository.findById(5L)).thenReturn(Optional.of(photo));

        HttpServletRequest req = mock(HttpServletRequest.class);

        var response = photoService.getPhoto(5L, req);

        assertThat(response.getId()).isEqualTo(5L);
        assertThat(response.getFileName()).isEqualTo("img.jpg");
        verify(photoRepository).findById(5L);
    }
}
