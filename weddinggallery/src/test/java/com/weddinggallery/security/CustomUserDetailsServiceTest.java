package com.weddinggallery.security;

import com.weddinggallery.model.Device;
import com.weddinggallery.model.User;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private DeviceRepository deviceRepository;

    @InjectMocks
    private CustomUserDetailsService service;

    private User user;
    private Device device;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("john")
                .password("pass")
                .roles(Set.of())
                .build();
        device = Device.builder()
                .id(2L)
                .clientId(UUID.randomUUID())
                .user(user)
                .build();
    }

    @Test
    void loadsByUsername() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));

        var details = service.loadUserByUsername("john");

        assertThat(details.getPassword()).isEqualTo("pass");
        verify(userRepository).findByUsername("john");
        verifyNoInteractions(deviceRepository);
    }

    @Test
    void loadsByDeviceId() {
        when(userRepository.findByUsername(device.getClientId().toString()))
                .thenReturn(Optional.empty());
        when(deviceRepository.findByClientId(device.getClientId()))
                .thenReturn(Optional.of(device));

        var details = service.loadUserByUsername(device.getClientId().toString());

        assertThat(details.getPassword()).isEqualTo("pass");
        verify(deviceRepository).findByClientId(device.getClientId());
    }

    @Test
    void unknownPrincipalThrows() {
        when(userRepository.findByUsername("none")).thenReturn(Optional.empty());
        when(deviceRepository.findByClientId(any())).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> service.loadUserByUsername("none"));
    }
}
