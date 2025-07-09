package com.weddinggallery.auth;

import com.weddinggallery.dto.auth.AuthResponse;
import com.weddinggallery.dto.auth.LoginRequest;
import com.weddinggallery.dto.auth.RegisterRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user authentication")
public class AuthController {

    private final AuthService authService;


    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT")
    public ResponseEntity<AuthResponse> login(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpReq
    ) {
        AuthResponse response = authService.login(request, clientId, httpReq);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/user")
    @Operation(summary = "Create standard user account")
    public ResponseEntity<Void> registerUser(@Valid @RequestBody RegisterRequest request) {
        authService.registerUser(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register/admin")
    @Operation(summary = "Create admin account")
    public ResponseEntity<Void> registerAdmin(@Valid @RequestBody RegisterRequest request) {
        authService.registerAdmin(request);
        return ResponseEntity.ok().build();
    }
}

