package com.weddinggallery.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatReactionResponse {
    private Long id;
    private String emoji;
    private Long messageId;
    private Long deviceId;
    private String deviceName;
}
