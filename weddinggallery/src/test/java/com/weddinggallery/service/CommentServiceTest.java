package com.weddinggallery.service;

import com.weddinggallery.model.Comment;
import com.weddinggallery.model.Device;
import com.weddinggallery.model.Photo;
import com.weddinggallery.dto.comment.CommentResponse;
import com.weddinggallery.repository.CommentRepository;
import com.weddinggallery.repository.PhotoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private PhotoRepository photoRepository;
    @Mock
    private DeviceService deviceService;

    @InjectMocks
    private CommentService commentService;

    private Comment c1;
    private Comment c2;

    @BeforeEach
    void setUp() {
        Device device = Device.builder()
                .id(1L)
                .clientId(UUID.randomUUID())
                .name("Phone")
                .build();
        Photo photo = Photo.builder().id(5L).build();
        c1 = Comment.builder()
                .id(10L)
                .text("first")
                .createdAt(LocalDateTime.now())
                .photo(photo)
                .author(device)
                .build();
        c2 = Comment.builder()
                .id(11L)
                .text("second")
                .createdAt(LocalDateTime.now())
                .photo(photo)
                .author(device)
                .build();
    }

    @Test
    void getCommentsPagesResults() {
        when(commentRepository.findByPhotoIdOrderByCreatedAt(5L))
                .thenReturn(List.of(c1, c2));

        Page<CommentResponse> page = commentService.getComments(5L, PageRequest.of(0, 1));

        assertThat(page.getTotalElements()).isEqualTo(2);
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getId()).isEqualTo(10L);
        verify(commentRepository).findByPhotoIdOrderByCreatedAt(5L);
    }

    @Test
    void secondPageReturnsNextComment() {
        when(commentRepository.findByPhotoIdOrderByCreatedAt(5L))
                .thenReturn(List.of(c1, c2));

        Page<CommentResponse> page = commentService.getComments(5L, PageRequest.of(1, 1));

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getId()).isEqualTo(11L);
    }
}
