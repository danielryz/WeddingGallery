package com.weddinggallery.controller;

import com.weddinggallery.auth.AuthService;
import com.weddinggallery.config.OpenApiConfig;
import com.weddinggallery.security.JwtAuthenticationFilter;
import com.weddinggallery.security.JwtTokenProvider;
import com.weddinggallery.service.CommentService;
import com.weddinggallery.service.PhotoService;
import com.weddinggallery.service.ReactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@Import(OpenApiConfig.class)
@AutoConfigureMockMvc(addFilters = false)
class OpenApiMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private CommentService commentService;

    @MockitoBean
    private PhotoService photoService;

    @MockitoBean
    private ReactionService reactionService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void apiDocsAccessible() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());
    }
}
