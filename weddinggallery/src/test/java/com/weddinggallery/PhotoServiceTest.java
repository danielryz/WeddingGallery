package com.weddinggallery;

import com.weddinggallery.model.Device;
import com.weddinggallery.model.Photo;
import com.weddinggallery.model.User;
import com.weddinggallery.repository.PhotoRepository;
import com.weddinggallery.service.DeviceService;
import com.weddinggallery.service.PhotoService;
import com.weddinggallery.service.UploadQueueService;
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
    void savesAllPhotosWhenExtensionsAllowed() throws Exception {
        MockMultipartFile file1 = new MockMultipartFile("files", "img1.jpg", "image/jpeg", new byte[0]);
        MockMultipartFile file2 = new MockMultipartFile("files", "video.mp4", "video/mp4", new byte[0]);
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(deviceService.getRequestingDevice(req)).thenReturn(device);

        photoService.savePhotos(List.of(file1, file2), List.of("d1", "d2"), req);

        verify(uploadQueueService, times(2)).submitUpload(any(Runnable.class));
        verifyNoInteractions(photoRepository);
    }

    @Test
    void unsupportedExtensionThrowsInSavePhotos() {
        MockMultipartFile file1 = new MockMultipartFile("files", "img1.jpg", "image/jpeg", new byte[0]);
        MockMultipartFile file2 = new MockMultipartFile("files", "doc.txt", "text/plain", new byte[0]);

        assertThrows(IllegalArgumentException.class,
                () -> photoService.savePhotos(
                        List.of(file1, file2),
                        List.of("d1", "d2"),
                        mock(HttpServletRequest.class)
                )
        );

        verifyNoInteractions(uploadQueueService);
    }
}
