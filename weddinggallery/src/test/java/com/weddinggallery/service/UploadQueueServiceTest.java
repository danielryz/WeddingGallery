package com.weddinggallery.service;

import org.junit.jupiter.api.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;

class UploadQueueServiceTest {

    @Test
    void taskRunsAsynchronously() throws Exception {
        UploadQueueService service = new UploadQueueService(1, 1, 10);
        service.init();
        AtomicBoolean executed = new AtomicBoolean(false);
        CountDownLatch latch = new CountDownLatch(1);

        service.submitUpload(() -> {
            executed.set(true);
            latch.countDown();
        });

        boolean finished = latch.await(1, TimeUnit.SECONDS);
        service.shutdown();

        assertThat(finished).isTrue();
        assertThat(executed.get()).isTrue();
    }
}
