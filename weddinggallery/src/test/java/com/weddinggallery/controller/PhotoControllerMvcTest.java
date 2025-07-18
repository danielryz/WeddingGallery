package com.weddinggallery.controller;

import com.weddinggallery.security.JwtTokenProvider;   // <– importujemy
import com.weddinggallery.service.PhotoService;
import com.weddinggallery.dto.photo.PhotoResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PhotoController.class)
@AutoConfigureMockMvc(addFilters = false)
class PhotoControllerMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PhotoService photoService;

     @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void getPhotosReturnsOk() throws Exception {
        Mockito.when(photoService.getPhotos(any(Pageable.class), any(Sort.class), any()))
                .thenReturn(Page.empty());

        mockMvc.perform(get("/api/photos").param("type", "image"))
                .andExpect(status().isOk());
    }

    @Test
    void getPhotoByIdReturnsOk() throws Exception {
        Mockito.when(photoService.getPhoto(Mockito.eq(1L), Mockito.any(HttpServletRequest.class)))
                .thenReturn(new PhotoResponse());

        mockMvc.perform(get("/api/photos/1"))
                .andExpect(status().isOk());
    }
}
