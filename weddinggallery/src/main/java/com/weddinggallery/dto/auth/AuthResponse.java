package com.weddinggallery.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String clientId;
    private String token;
    private String deviceName;
}

