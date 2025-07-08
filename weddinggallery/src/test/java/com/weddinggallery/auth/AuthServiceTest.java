package com.weddinggallery.auth;

import com.weddinggallery.dto.auth.LoginRequest;
import com.weddinggallery.model.Device;
import com.weddinggallery.model.Role;
import com.weddinggallery.model.User;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.repository.RoleRepository;
import com.weddinggallery.repository.UserRepository;
import com.weddinggallery.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private DeviceRepository deviceRepository;

    @InjectMocks
    private AuthService authService;

    private User user;
    private Role role;

    @BeforeEach
    void setUp() {
        String enc = new BCryptPasswordEncoder().encode("pass");
        user = User.builder()
                .id(1L)
                .username("john")
                .password(enc)
                .roles(Set.of())
                .build();
        role = Role.builder()
                .id(2L)
                .name("ROLE_USER")
                .build();
    }

    @Test
    void loginWithValidCredentials() {
        LoginRequest request = new LoginRequest("john", "pass", "myDevice");
        HttpServletRequest httpReq = mock(HttpServletRequest.class);
        when(httpReq.getHeader("User-Agent")).thenReturn("JUnit");
        when(httpReq.getHeader("X-ClientId")).thenReturn(null);

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(role));
        when(jwtTokenProvider.createToken(any(), any())).thenReturn("jwt");
        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(mock(Authentication.class));
        when(deviceRepository.save(any(Device.class))).thenAnswer(invocation -> {
            Device d = invocation.getArgument(0);
            d.setId(1L);
            if (d.getClientId() == null) {
                d.setClientId(UUID.randomUUID());
            }
            d.setCreatedAt(LocalDateTime.now());
            return d;
        });

        var response = authService.login(request, httpReq);

        verify(authenticationManager).authenticate(argThat(auth ->
                auth instanceof UsernamePasswordAuthenticationToken &&
                        "john".equals(auth.getPrincipal()) &&
                        "pass".equals(auth.getCredentials())
        ));
        assertThat(response.getToken()).isEqualTo("jwt");
        assertThat(response.getClientId()).isNotBlank();
        verify(deviceRepository).save(any(Device.class));
    }
}
