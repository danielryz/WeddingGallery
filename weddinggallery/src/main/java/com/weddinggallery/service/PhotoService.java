package com.weddinggallery.service;

import com.weddinggallery.model.Photo;
import com.weddinggallery.model.Device;
import com.weddinggallery.repository.PhotoRepository;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.weddinggallery.service.StorageService;

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

    public List<Photo> getAllPhotos(){
        return photoRepository.findAll();
    }

    public org.springframework.data.domain.Page<Photo> getPhotos(org.springframework.data.domain.Pageable pageable, org.springframework.data.domain.Sort sort) {
        org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        return photoRepository.findAll(org.springframework.data.jpa.domain.Specification.where(null), pageRequest);
    }

    public Photo savePhoto(MultipartFile file, String description, HttpServletRequest request) throws IOException {
        Device device = getRequestingDevice(request);
        String filename = storageService.store(file);
        Photo photo = Photo.builder()
                .fileName(filename)
                .device(device)
                .uploader(device.getUser())
                .description(description)
                .commentCount(0)
                .reactionCount(0)
                .uploadTime(LocalDateTime.now())
                .build();
        return photoRepository.save(photo);
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

    public Photo updatePhotoDescription(Long id, String description, HttpServletRequest request){
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
        return photoRepository.save(photo);
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
        return deviceRepository.findByClientId(UUID.fromString(clientId))
                .orElseThrow(() -> new AccessDeniedException("Device not found"));
    }

}
