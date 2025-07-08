package com.weddinggallery.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@Profile("local")
public class LocalStorageService implements StorageService {
    @Value("${storage.local.path:photos}")
    private String rootDir;

    private Path root;

    @PostConstruct
    public void init() {
        try {
            root = Paths.get(rootDir);
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("Could not create storage directory", e);
        }
    }

    @Override
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

    @Override
    public void delete(String filename) throws IOException {
        if (!StringUtils.hasText(filename)) {
            return;
        }
        Path path = root.resolve(filename);
        Files.deleteIfExists(path);
    }

    @Override
    public InputStream open(String filename) throws IOException {
        Path path = root.resolve(filename);
        if (!Files.exists(path)) {
            throw new IOException("File not found: " + filename);
        }
        return Files.newInputStream(path);
    }
}
