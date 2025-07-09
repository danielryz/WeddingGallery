package com.weddinggallery.service;

import com.weddinggallery.model.Photo;
import com.weddinggallery.model.Device;
import com.weddinggallery.repository.PhotoRepository;
import com.weddinggallery.repository.DeviceRepository;
import com.weddinggallery.repository.PhotoSpecifications;
import com.weddinggallery.dto.photo.PhotoResponse;
import com.weddinggallery.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
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

    static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "bmp", "tif", "tiff", "webp",
            "heic", "heif", "raw", "cr2", "nef", "arw", "orf", "raf",
            "dng", "rw2", "sr2", "srf", "pef", "avif", "jxl", "ppm",
            "pgm", "pbm", "sgi", "rgb", "ico", "icns", "svg", "eps",
            "psd", "xcf", "tga", "exr"
    );

    static final Set<String> ALLOWED_VIDEO_EXTENSIONS = Set.of(
            "mp4", "mov", "avi", "mkv", "flv", "f4v", "wmv", "asf",
            "webm", "mpg", "mpeg", "3gp", "3g2", "m4v", "mts", "m2ts",
            "ts", "vob", "divx", "xvid", "ogv", "rm", "rmvb", "amv",
            "f4p", "dat", "dv", "mod", "tod"
    );

    static final Set<String> ALLOWED_EXTENSIONS = Set.copyOf(
            java.util.stream.Stream.concat(
                    ALLOWED_IMAGE_EXTENSIONS.stream(),
                    ALLOWED_VIDEO_EXTENSIONS.stream()
            ).collect(java.util.stream.Collectors.toSet())
    );

    public List<Photo> getAllPhotos(){
        return photoRepository.findAll();
    }

    public Page<PhotoResponse> getPhotos(Pageable pageable, Sort sort, String type) {
        Set<String> extensions = null;
        if (type != null) {
            if ("image".equalsIgnoreCase(type)) {
                extensions = ALLOWED_IMAGE_EXTENSIONS;
            } else if ("video".equalsIgnoreCase(type)) {
                extensions = ALLOWED_VIDEO_EXTENSIONS;
            }
        }

        PageRequest pageRequest = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort
        );

        Specification<Photo> spec = PhotoSpecifications.isVisible(true);
        if (extensions != null) {
            spec = spec.and(PhotoSpecifications.withExtensions(extensions));
        }

        // 4. Wykonaj zapytanie
        return photoRepository
                .findAll(spec, pageRequest)
                .map(this::toResponse);
    }

    @Transactional
    public PhotoResponse savePhoto(MultipartFile file, String description, HttpServletRequest request) throws IOException {
        return toResponse(savePhotoEntity(file, description, request));
    }

    @Transactional
    public List<PhotoResponse> savePhotos(List<MultipartFile> files,
                                            List<String> descriptions,
                                            HttpServletRequest request) throws IOException {
        if (files == null || files.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        if (descriptions == null) {
            descriptions = Collections.emptyList();
        }

        // Validate all files first so none are stored when an invalid extension is present
        for (MultipartFile file : files) {
            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (!StringUtils.hasText(ext) || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
                throw new IllegalArgumentException("Unsupported file extension: " + ext);
            }
        }

        List<Photo> saved = new java.util.ArrayList<>();
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            String description = descriptions.size() > i ? descriptions.get(i) : null;
            saved.add(savePhotoEntity(file, description, request));
        }
        return saved.stream().map(this::toResponse).toList();
    }

    @Transactional
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

    @Transactional
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

    @Transactional
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
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AccessDeniedException("Missing token");
        }

        String headerClientId = request.getHeader("X-client-Id");
        if (headerClientId == null || headerClientId.isBlank()) {
            throw new AccessDeniedException("Missing client id header");
        }

        String token = authHeader.substring(7);
        String tokenClientId = tokenProvider.getClientIdFromToken(token);
        if (!headerClientId.equals(tokenClientId)) {
            throw new AccessDeniedException("Client id mismatch");
        }

        return deviceRepository.findByClientIdWithUser(UUID.fromString(tokenClientId))
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
