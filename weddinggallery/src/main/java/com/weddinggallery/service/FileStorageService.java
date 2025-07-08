package com.weddinggallery.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {
    private final Path root = Paths.get("photos");

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("Could not create storage directory", e);
        }
    }

    public String store(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename();
        String ext = StringUtils.getFilenameExtension(original);
        String filename = UUID.randomUUID().toString();
        if (StringUtils.hasText(ext)) {
            filename += "." + ext;
        }
        Path dest = root.resolve(filename);
        Files.copy(file.getInputStream(), dest);
        return filename;
    }

    public void delete(String filename) throws IOException {
        if (!StringUtils.hasText(filename)) {
            return;
        }
        Path path = root.resolve(filename);
        Files.deleteIfExists(path);
    }

    public Path load(String filename) {
        return root.resolve(filename);
    }
}
