package com.weddinggallery.controller;

import com.weddinggallery.model.Photo;
import com.weddinggallery.service.PhotoService;
import com.weddinggallery.dto.photo.PhotoDescriptionUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("api/photos")
@RequiredArgsConstructor
@Tag(name = "Photos", description = "Operations related to photos")
public class PhotoController {

    private final PhotoService photoService;

    @GetMapping
    @Operation(summary = "Get all photos")
    public List<Photo> getAllPhotos(){
        return photoService.getAllPhotos();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Save a photo")
    public Photo savePhoto(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "description", required = false) String description,
            HttpServletRequest request
    ) throws java.io.IOException {
        return photoService.savePhoto(file, description, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete photo by id")
    public void deletePhoto(@PathVariable Long id, HttpServletRequest request){
        photoService.deletePhoto(id, request);
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Admin delete photo by id")
    public void adminDeletePhoto(@PathVariable Long id, HttpServletRequest request){
        photoService.deletePhoto(id, request);
    }

    @GetMapping("/archive")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Download all photos as zip")
    public void downloadAllPhotos(HttpServletResponse response) throws java.io.IOException {
        photoService.streamAllPhotosZip(response);
    }

    @PutMapping("/{id}/description")
    @Operation(summary = "Update photo description")
    public Photo updateDescription(
            @PathVariable Long id,
            @RequestBody PhotoDescriptionUpdateRequest updateRequest,
            HttpServletRequest request
    ) {
        return photoService.updatePhotoDescription(id, updateRequest.getDescription(), request);
    }


}
