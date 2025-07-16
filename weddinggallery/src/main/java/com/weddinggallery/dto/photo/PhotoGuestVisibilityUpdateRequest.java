package com.weddinggallery.dto.photo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhotoGuestVisibilityUpdateRequest {
    @JsonProperty("isVisibleForGuest")
    private boolean isVisibleForGuest;
}
