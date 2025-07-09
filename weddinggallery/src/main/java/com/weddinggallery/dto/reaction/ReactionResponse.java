package com.weddinggallery.dto.reaction;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReactionResponse {
    private Long id;
    private String type;
    private Long photoId;
    private Long deviceId;
}
