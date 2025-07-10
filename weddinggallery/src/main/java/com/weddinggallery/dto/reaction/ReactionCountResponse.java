package com.weddinggallery.dto.reaction;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReactionCountResponse {
    private String type;
    private long count;
}
