package com.weddinggallery.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatReactionCountResponse {
    private String emoji;
    private long count;
}
