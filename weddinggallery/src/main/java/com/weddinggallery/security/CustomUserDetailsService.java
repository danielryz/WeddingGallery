package com.weddinggallery.security;

import com.weddinggallery.model.User;
import com.weddinggallery.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String principal)
            throws UsernameNotFoundException {
        User user = userRepository.findByUsername(principal)
                .or(() -> userRepository.findByClientId(principal))
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + principal));
        return UserPrincipal.from(user);
    }
}
