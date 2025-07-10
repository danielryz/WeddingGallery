package com.weddinggallery.util;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.FileCopyUtils;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * MultipartFile implementation that buffers the contents either in memory or on disk.
 */
public class BufferedMultipartFile implements MultipartFile {
    private static final long MEMORY_THRESHOLD = 1024 * 1024; // 1MB

    private final String name;
    private final String originalFilename;
    private final String contentType;
    private final long size;

    private byte[] bytes;
    private Path tempFile;

    public BufferedMultipartFile(MultipartFile file) throws IOException {
        this.name = file.getName();
        this.originalFilename = file.getOriginalFilename();
        this.contentType = file.getContentType();
        this.size = file.getSize();

        if (size <= MEMORY_THRESHOLD) {
            this.bytes = file.getBytes();
        } else {
            Path tmpDir = Paths.get(System.getProperty("java.io.tmpdir"));
            this.tempFile = Files.createTempFile(tmpDir, "upload-", ".tmp");
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, tempFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
        }
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getOriginalFilename() {
        return originalFilename;
    }

    @Override
    public String getContentType() {
        return contentType;
    }

    @Override
    public boolean isEmpty() {
        return size == 0;
    }

    @Override
    public long getSize() {
        return size;
    }

    @Override
    public byte[] getBytes() throws IOException {
        if (bytes != null) {
            return bytes;
        }
        return Files.readAllBytes(tempFile);
    }

    @Override
    public InputStream getInputStream() throws IOException {
        if (bytes != null) {
            return new ByteArrayInputStream(bytes);
        }
        return Files.newInputStream(tempFile);
    }

    @Override
    public void transferTo(File dest) throws IOException, IllegalStateException {
        if (bytes != null) {
            FileCopyUtils.copy(bytes, dest);
        } else {
            Files.copy(tempFile, dest.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }
    }

    /**
     * Delete the temporary file if one was created.
     */
    public void cleanup() {
        if (tempFile != null) {
            try {
                Files.deleteIfExists(tempFile);
            } catch (IOException ignored) {
            }
        }
    }
}
