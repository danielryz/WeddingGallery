package com.weddinggallery.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Service
public class UploadQueueService {

    private final int corePoolSize;
    private final int maxPoolSize;
    private final int queueCapacity;
    private ThreadPoolTaskExecutor executor;

    public UploadQueueService(
            @Value("${upload.executor.core-pool-size:2}") int corePoolSize,
            @Value("${upload.executor.max-pool-size:4}") int maxPoolSize,
            @Value("${upload.executor.queue-capacity:50}") int queueCapacity) {
        this.corePoolSize = corePoolSize;
        this.maxPoolSize = maxPoolSize;
        this.queueCapacity = queueCapacity;
    }

    @PostConstruct
    public void init() {
        executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("upload-");
        executor.initialize();
    }

    public void submitUpload(Runnable task) {
        executor.execute(task);
    }

    @PreDestroy
    public void shutdown() {
        if (executor != null) {
            executor.shutdown();
        }
    }
}
