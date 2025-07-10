package com.weddinggallery.dto.comment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private String text;
    private LocalDateTime createdAt;
    private Long photoId;
    private Long deviceId;
    private String deviceName;
}

