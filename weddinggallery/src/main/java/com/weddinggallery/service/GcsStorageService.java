package com.weddinggallery.service;

import com.google.cloud.ReadChannel;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.channels.Channels;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@Profile("gcs")
public class GcsStorageService implements StorageService {

    private final Storage storage;

    @Value("${gcs.bucket}")
    private String bucket;

    public GcsStorageService(Storage storage) {
        this.storage = storage;
    }

    @PostConstruct
    public void init() {
        // bucket must already exist and credentials be configured
    }

    @Override
    public String store(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename();
        String ext = StringUtils.getFilenameExtension(original);
        String filename = UUID.randomUUID().toString();
        if (StringUtils.hasText(ext)) {
            filename += "." + ext;
        }
        BlobId blobId = BlobId.of(bucket, filename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();
        storage.create(blobInfo, file.getBytes());
        return filename;
    }

    @Override
    public void delete(String filename) throws IOException {
        if (!StringUtils.hasText(filename)) {
            return;
        }
        storage.delete(BlobId.of(bucket, filename));
    }

    @Override
    public InputStream open(String filename) throws IOException {
        Blob blob = storage.get(BlobId.of(bucket, filename));
        if (blob == null) {
            throw new IOException("File not found: " + filename);
        }
        ReadChannel reader = blob.reader();
        return Channels.newInputStream(reader);
    }
}

