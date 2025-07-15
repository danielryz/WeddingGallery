package com.weddinggallery.service;

import com.weddinggallery.repository.PhotoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.awt.*;
import java.awt.font.FontRenderContext;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class PhotoServiceAddFrameAndTextTest {

    @Mock
    private PhotoRepository photoRepository;
    @Mock
    private DeviceService deviceService;
    @Mock
    private StorageService storageService;
    @Mock
    private UploadQueueService uploadQueueService;

    @InjectMocks
    private PhotoService photoService;

    @Test
    void longTextDoesNotExceedImageWidth() {
        BufferedImage src = new BufferedImage(100, 50, BufferedImage.TYPE_INT_RGB);
        String desc = "This is a really really long description meant to exceed the width";

        BufferedImage out = ReflectionTestUtils.invokeMethod(photoService, "addFrameAndText", src, desc, "Device");

        Font font = new Font("Serif", Font.PLAIN, 24);
        FontRenderContext frc = new FontRenderContext(new AffineTransform(), true, true);
        int pad = 20;
        Rectangle textBounds = font.getStringBounds("Device: " + desc, frc).getBounds();
        int expectedWidth = Math.max(src.getWidth(), textBounds.width) + pad * 2;
        int expectedHeight = src.getHeight() + pad * 2 + textBounds.height + pad;

        assertThat(out.getWidth()).isEqualTo(expectedWidth);
        assertThat(out.getHeight()).isEqualTo(expectedHeight);
    }
}
