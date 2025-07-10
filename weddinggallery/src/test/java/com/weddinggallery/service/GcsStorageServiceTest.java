package com.weddinggallery.service;

import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class GcsStorageServiceTest {

    @Mock
    private Storage storage;

    @InjectMocks
    private GcsStorageService service;

    @Test
    void storeUsesStreamingUpload() throws Exception {
        ReflectionTestUtils.setField(service, "bucket", "bucket");
        MultipartFile file = new StreamingMultipartFile("video.mp4", "video/mp4", 50 * 1024 * 1024);

        String name = service.store(file);

        assertThat(name).isNotBlank();
        verify(storage).createFrom(any(BlobInfo.class), any(InputStream.class));
    }

    private static class StreamingMultipartFile implements MultipartFile {
        private final String originalFilename;
        private final String contentType;
        private final long size;

        StreamingMultipartFile(String originalFilename, String contentType, long size) {
            this.originalFilename = originalFilename;
            this.contentType = contentType;
            this.size = size;
        }

        @Override
        public String getName() {
            return "file";
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
            throw new IOException("getBytes should not be called");
        }

        @Override
        public InputStream getInputStream() {
            return new InputStream() {
                long count = 0;

                @Override
                public int read() {
                    if (count++ >= size) {
                        return -1;
                    }
                    return 0;
                }
            };
        }

        @Override
        public void transferTo(java.io.File dest) {
            throw new UnsupportedOperationException();
        }
    }
}
