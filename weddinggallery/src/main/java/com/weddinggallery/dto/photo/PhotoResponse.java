package com.weddinggallery.dto.photo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhotoResponse {
    private Long id;
    private String fileName;
    private String description;
    private LocalDateTime uploadTime;
    private int commentCount;
    private int reactionCount;
    private String uploaderUsername;
    private Long deviceId;
    private boolean visible;
}
