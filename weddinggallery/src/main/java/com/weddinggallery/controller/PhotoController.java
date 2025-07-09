package com.weddinggallery.controller;

import com.weddinggallery.dto.photo.PhotoResponse;
import com.weddinggallery.service.PhotoService;
import com.weddinggallery.dto.photo.PhotoDescriptionUpdateRequest;
import com.weddinggallery.dto.photo.PhotoVisibilityUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
@Tag(name = "Photos", description = "Operations related to photos")
public class PhotoController {

    private final PhotoService photoService;

    @GetMapping
    @Operation(summary = "Get all photos")
    public ResponseEntity<org.springframework.data.domain.Page<PhotoResponse>> getPhotos(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "uploadTime") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String type
    ){
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Sort sort = com.weddinggallery.util.SortUtil.from(sortBy, direction);
        var result = photoService.getPhotos(pageable, sort, type);
        return ResponseEntity.ok(result);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Save a photo")
    public ResponseEntity<PhotoResponse> savePhoto(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "description", required = false) String description,
            HttpServletRequest request
    ) throws java.io.IOException {
        PhotoResponse response = photoService.savePhoto(file, description, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Save multiple photos")
    public ResponseEntity<List<PhotoResponse>> savePhotos(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "descriptions", required = false) List<String> descriptions,
            HttpServletRequest request
    ) throws java.io.IOException {
        var photos = photoService.savePhotos(files, descriptions, request);
        return ResponseEntity.ok(photos);
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Admin delete photo by id",
            description = "Deletes the specified photo as an administrator")
    @ApiResponse(responseCode = "204", description = "Photo deleted")
    public ResponseEntity<Void> adminDeletePhoto(@PathVariable Long id, HttpServletRequest request){
        photoService.deletePhoto(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete photo by id",
            description = "Deletes the specified photo if the requesting device is authorized")
    @ApiResponse(responseCode = "204", description = "Photo deleted")
    public ResponseEntity<Void> deletePhoto(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @PathVariable Long id,
            HttpServletRequest request
    ){
        photoService.deletePhoto(id, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/archive")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Download all photos as zip")
    public void downloadAllPhotos(HttpServletResponse response) throws java.io.IOException {
        photoService.streamAllPhotosZip(response);
    }

    @PutMapping("/{id}/description")
    @Operation(summary = "Update photo description")
    public ResponseEntity<PhotoResponse> updateDescription(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @PathVariable Long id,
            @RequestBody PhotoDescriptionUpdateRequest updateRequest,
            HttpServletRequest request
    ) {
        PhotoResponse response = photoService.updatePhotoDescription(id, updateRequest.getDescription(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/visibility")
    @Operation(summary = "Update photo visibility")
    public ResponseEntity<PhotoResponse> updateVisibility(
            @RequestHeader(value = "X-client-Id", required = false) String clientId,
            @PathVariable Long id,
            @RequestBody PhotoVisibilityUpdateRequest updateRequest,
            HttpServletRequest request
    ) {
        PhotoResponse response = photoService.updatePhotoVisibility(id, updateRequest.isVisible(), request);
        return ResponseEntity.ok(response);
    }


}
