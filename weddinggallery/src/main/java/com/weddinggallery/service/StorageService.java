package com.weddinggallery.service;

import java.io.IOException;
import java.io.InputStream;
import org.springframework.web.multipart.MultipartFile;

import static com.weddinggallery.service.PhotoService.ALLOWED_IMAGE_EXTENSIONS;

public interface StorageService {
    String store(MultipartFile file) throws IOException;
    void delete(String filename) throws IOException;
    InputStream open(String filename) throws IOException;

    static boolean isImageExtension(String ext) {
        return ALLOWED_IMAGE_EXTENSIONS.contains(ext.toLowerCase());
    }
}

