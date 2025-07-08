package com.weddinggallery.service;

import java.io.IOException;
import java.io.InputStream;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file) throws IOException;
    void delete(String filename) throws IOException;
    InputStream open(String filename) throws IOException;
}
