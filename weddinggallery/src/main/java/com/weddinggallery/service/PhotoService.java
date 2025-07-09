package com.weddinggallery.service;

import com.weddinggallery.model.Photo;
import com.weddinggallery.model.Device;
import com.weddinggallery.repository.PhotoRepository;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.repository.PhotoSpecifications;
import com.weddinggallery.dto.photo.PhotoResponse;
import com.weddinggallery.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.weddinggallery.service.StorageService;
import java.util.Set;

import java.io.IOException;
import java.time.LocalDateTime;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoService {
    private final PhotoRepository photoRepository;
    private final DeviceRepository deviceRepository;
    private final JwtTokenProvider tokenProvider;
    private final StorageService storageService;

    static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "bmp", "webp", "heic"
    );

    public List<Photo> getAllPhotos(){
        return photoRepository.findAll();
    }

    public org.springframework.data.domain.Page<PhotoResponse> getPhotos(org.springframework.data.domain.Pageable pageable, org.springframework.data.domain.Sort sort) {
        org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        return photoRepository
                .findAll(org.springframework.data.jpa.domain.Specification.where(
                        com.weddinggallery.repository.PhotoSpecifications.isVisible(true)), pageRequest)
                .map(this::toResponse);
    }

    public PhotoResponse savePhoto(MultipartFile file, String description, HttpServletRequest request) throws IOException {
        return toResponse(savePhotoEntity(file, description, request));
    }

    public java.util.List<Photo> savePhotos(java.util.List<MultipartFile> files,
                                            java.util.List<String> descriptions,
                                            HttpServletRequest request) throws IOException {
        if (files == null || files.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        java.util.List<Photo> saved = new java.util.ArrayList<>();
        if (descriptions == null) {
            descriptions = java.util.Collections.emptyList();
        }
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            String description = descriptions.size() > i ? descriptions.get(i) : null;
            saved.add(savePhotoEntity(file, description, request));
        }
        return saved;
    }

    public void deletePhoto(Long id, HttpServletRequest request){
        Device device = getRequestingDevice(request);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new AccessDeniedException("Photo not found"));

        if(!isAdmin && (photo.getDevice() == null || !photo.getDevice().getId().equals(device.getId()))){
            throw new AccessDeniedException("Not authorized to delete this photo");
        }

        try {
            storageService.delete(photo.getFileName());
        } catch (IOException e) {
            // log and continue deletion
        }
        photoRepository.delete(photo);
    }

    public PhotoResponse updatePhotoDescription(Long id, String description, HttpServletRequest request){
        Device device = getRequestingDevice(request);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new AccessDeniedException("Photo not found"));

        if(!isAdmin && (photo.getDevice() == null || !photo.getDevice().getId().equals(device.getId()))){
            throw new AccessDeniedException("Not authorized to update this photo");
        }

        photo.setDescription(description);
        return toResponse(photoRepository.save(photo));
    }

    public PhotoResponse updatePhotoVisibility(Long id, boolean visible, HttpServletRequest request){
        Device device = getRequestingDevice(request);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new AccessDeniedException("Photo not found"));

        if(!isAdmin && (photo.getDevice() == null || !photo.getDevice().getId().equals(device.getId()))){
            throw new AccessDeniedException("Not authorized to update this photo");
        }

        photo.setVisible(visible);
        return toResponse(photoRepository.save(photo));
    }

    public void streamAllPhotosZip(HttpServletResponse response) throws java.io.IOException {
        List<Photo> photos = photoRepository.findAll();
        response.setContentType("application/zip");
        response.setHeader("Content-Disposition", "attachment; filename=photos.zip");
        try (ZipOutputStream zos = new ZipOutputStream(response.getOutputStream())) {
            for (Photo photo : photos) {
                if (StringUtils.hasText(photo.getFileName())) {
                    try (InputStream in = storageService.open(photo.getFileName())) {
                        zos.putNextEntry(new ZipEntry(photo.getFileName()));
                        in.transferTo(zos);
                        zos.closeEntry();
                    } catch (IOException ex) {
                        // ignore missing files
                    }
                }
            }
        }
    }

    private Device getRequestingDevice(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new AccessDeniedException("Missing token");
        }
        String token = header.substring(7);
        String clientId = tokenProvider.getClientIdFromToken(token);
        return deviceRepository.findByClientIdWithUser(UUID.fromString(clientId))
                .orElseThrow(() -> new AccessDeniedException("Device not found"));
    }

    private Photo savePhotoEntity(MultipartFile file, String description, HttpServletRequest request) throws IOException {
        Device device = getRequestingDevice(request);
        String original = file.getOriginalFilename();
        String ext = StringUtils.getFilenameExtension(original);
        if (!StringUtils.hasText(ext) || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported file extension: " + ext);
        }
        String filename = storageService.store(file);
        Photo photo = Photo.builder()
                .fileName(filename)
                .device(device)
                .uploader(device.getUser())
                .description(description)
                .visible(true)
                .commentCount(0)
                .reactionCount(0)
                .uploadTime(LocalDateTime.now())
                .build();
        return photoRepository.save(photo);
    }

    private PhotoResponse toResponse(Photo photo) {
        return new PhotoResponse(
                photo.getId(),
                photo.getFileName(),
                photo.getDescription(),
                photo.getUploadTime(),
                photo.getCommentCount(),
                photo.getReactionCount(),
                photo.getUploader() != null ? photo.getUploader().getUsername() : null,
                photo.getDevice() != null ? photo.getDevice().getId() : null,
                photo.isVisible()
        );
    }

}
