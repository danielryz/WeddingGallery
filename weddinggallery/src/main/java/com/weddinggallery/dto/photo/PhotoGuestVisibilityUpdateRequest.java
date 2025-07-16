package com.weddinggallery.dto.photo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhotoGuestVisibilityUpdateRequest {
    private boolean isVisibleForGuest;
}
