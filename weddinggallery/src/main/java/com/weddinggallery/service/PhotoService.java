package com.weddinggallery.service;

import com.weddinggallery.model.Photo;
import com.weddinggallery.model.Device;
import com.weddinggallery.repository.PhotoRepository;
import com.weddinggallery.repository.PhotoSpecifications;
import com.weddinggallery.dto.photo.PhotoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.weddinggallery.util.BufferedMultipartFile;

import java.awt.*;
import java.awt.font.FontRenderContext;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Collections;
import java.util.Set;

import java.io.IOException;
import java.time.LocalDateTime;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.io.InputStream;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.util.List;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhotoService {
    private final PhotoRepository photoRepository;
    private final DeviceService deviceService;
    private final StorageService storageService;
    private final UploadQueueService uploadQueueService;

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
            Stream.concat(
                    ALLOWED_IMAGE_EXTENSIONS.stream(),
                    ALLOWED_VIDEO_EXTENSIONS.stream()
            ).collect(Collectors.toSet())
    );

    public List<Photo> getAllPhotos(){
        return photoRepository.findAll();
    }

    public Page<PhotoResponse> getPhotosByDeviceId(Pageable pageable, Sort sort, String type, HttpServletRequest request){
        Device device = deviceService.getRequestingDevice(request);

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
        spec = spec.and(PhotoSpecifications.withDeviceId(device.getId()));
        if (extensions != null) {
            spec = spec.and(PhotoSpecifications.withExtensions(extensions));
        }
        return photoRepository.findAll(spec, pageRequest).map(photo -> toResponse(photo, isVideo(photo.getFileName())));
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
        return photoRepository
                .findAll(spec, pageRequest)
                .map(photo -> toResponse(photo, isVideo(photo.getFileName())));
    }

    @Transactional
    public PhotoResponse getPhoto(Long id) {
        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new AccessDeniedException("Photo not found"));
        return toResponse(photo, isVideo(photo.getFileName()));
    }

    public void savePhoto(MultipartFile file, String description, HttpServletRequest request, Boolean isVisibleForGuest) throws IOException {
        // validate requesting device before queuing the upload
        deviceService.getRequestingDevice(request);
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (!StringUtils.hasText(ext) || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported file extension: " + ext);
        }
        BufferedMultipartFile buffered = new BufferedMultipartFile(file);
        uploadQueueService.submitUpload(() -> {
            try {
                savePhotoEntity(buffered, description, request, isVisibleForGuest, true);
            } catch (IOException e) {
                log.error("Failed to store file", e);
            } finally {
                buffered.cleanup();
            }
        });
    }

    public void savePhotos(List<MultipartFile> files,
                                            List<String> descriptions,
                                            HttpServletRequest request) throws IOException {
        // validate requesting device before queuing the uploads
        deviceService.getRequestingDevice(request);
        if (files == null || files.isEmpty()) {
            return;
        }
        if (descriptions == null) {
            descriptions = Collections.emptyList();
        }

        for (MultipartFile file : files) {
            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (!StringUtils.hasText(ext) || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
                throw new IllegalArgumentException("Unsupported file extension:" + ext);
            }
        }

        for (int i = 0; i < files.size(); i++) {
            MultipartFile original = files.get(i);
            BufferedMultipartFile buffered = new BufferedMultipartFile(original);
            String description = descriptions.size() > i ? descriptions.get(i) : null;
            uploadQueueService.submitUpload(() -> {
                try {
                    savePhotoEntity(buffered, description, request, true, false);
                } catch (IOException e) {
                    log.error("Failed to store file", e);
                } finally {
                    buffered.cleanup();
                }
            });
        }
    }

    @Transactional
    public void deletePhoto(Long id, HttpServletRequest request){
        Device device = deviceService.getRequestingDevice(request);
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
    public void updatePhotoDescription(Long id, String description, HttpServletRequest request){
        Device device = deviceService.getRequestingDevice(request);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new AccessDeniedException("Photo not found"));

        if(!isAdmin && (photo.getDevice() == null || !photo.getDevice().getId().equals(device.getId()))){
            throw new AccessDeniedException("Not authorized to update this photo");
        }

        photo.setDescription(description);

    }

    @Transactional
    public void updatePhotoVisibility(Long id, boolean visible, HttpServletRequest request){
        Device device = deviceService.getRequestingDevice(request);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new AccessDeniedException("Photo not found"));

        if(!isAdmin && (photo.getDevice() == null || !photo.getDevice().getId().equals(device.getId()))){
            throw new AccessDeniedException("Not authorized to update this photo");
        }

        photo.setVisible(visible);
        photoRepository.save(photo);
    }

    public void streamAllPhotosZip(HttpServletResponse response) throws IOException {
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
                        throw new IOException("Failed to download photos", ex);
                    }
                }
            }
        }
    }

    public byte[] getFramedPhoto(Long photoId) throws IOException {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Photo not found" +  photoId));
        try {
            InputStream in = storageService.open(photo.getFileName());
            BufferedImage src = ImageIO.read(in);
            BufferedImage framed = addFrameAndText(src, photo.getDescription(), photo.getDevice() != null ? photo.getDevice().getName() : null);

            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                ImageIO.write(framed, "png", baos);
                return baos.toByteArray();
            }
            }catch (IOException ex) {
            log.error("Error generating framed photo {}", photoId, ex);
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Error generating framed photo", ex);
        }
    }

    public void streamAllPhotosWithDescriptionZip(HttpServletResponse response) throws IOException {
        List<Photo> photos = photoRepository.findAll();
        response.setContentType("application/zip");
        response.setHeader("Content-Disposition", "attachment; filename=media_with_descriptions.zip");
        try (ZipOutputStream zos = new ZipOutputStream(response.getOutputStream())) {
            for (Photo photo : photos) {
                String fn = photo.getFileName();
                String ext = StringUtils.getFilenameExtension(fn);

                if (ext != null && StorageService.isImageExtension(ext)){
                    byte[] pngBytes = getFramedPhoto(photo.getId());
                    zos.putNextEntry(new ZipEntry("photo-" + photo.getId() + ".png"));
                    zos.write(pngBytes);
                    zos.closeEntry();
                } else {
                    try (InputStream in = storageService.open(fn)) {
                        zos.putNextEntry(new ZipEntry("video-" + photo.getId() + "." + ext));
                        in.transferTo(zos);
                        zos.closeEntry();
                    }
                }
            }
            zos.finish();
        }catch (IOException ex) {
            log.error("Error streaming ZIP file", ex);
            throw new RuntimeException("Failed to create ZIP", ex);
        }

    }

    private void savePhotoEntity(MultipartFile file, String description, HttpServletRequest request, Boolean isVisbleForGuest, Boolean isWish) throws IOException {
        Device device = deviceService.getRequestingDevice(request);
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
                .isVisibleForGuset(isVisbleForGuest)
                .isWish(isWish)
                .build();
        photoRepository.save(photo);
    }

    private BufferedImage addFrameAndText(BufferedImage src, String description, String deviceName) {
        int pad = 20;
        int fontSize = 24;
        Font font = new Font("Serif", Font.PLAIN, fontSize);

        FontRenderContext frc = new FontRenderContext(new AffineTransform(), true, true);
        Rectangle textBounds;
        String str;
        if (deviceName != null && !deviceName.isBlank()) {
            str = deviceName + ": " + description;
            textBounds = font.getStringBounds(str, frc).getBounds();
        } else {
            str = description;
            textBounds = font.getStringBounds(str, frc).getBounds();
        }

        int newW = src.getWidth() + pad * 2;
        int newH = src.getHeight() + pad * 2 + textBounds.height + pad;

        BufferedImage out = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = out.createGraphics();
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, newW, newH);
        g2d.setRenderingHint(
                RenderingHints.KEY_TEXT_ANTIALIASING,
                RenderingHints.VALUE_TEXT_ANTIALIAS_ON
        );

        g2d.drawImage(src, pad, pad, null);
        g2d.setFont(font);
        g2d.setColor(Color.DARK_GRAY);
        int textX = (newW - textBounds.width) / 2;
        int textY = src.getHeight() + pad * 2 + textBounds.height - fontSize/4;

        g2d.drawString(str, textX, textY);
        g2d.dispose();
        return out;
    }


    private boolean isVideo(String fileName) {
        String ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        return ALLOWED_VIDEO_EXTENSIONS.contains(ext);
    }

    private PhotoResponse toResponse(Photo photo, boolean isVideo) {
        return new PhotoResponse(
                photo.getId(),
                photo.getFileName(),
                photo.getDescription(),
                photo.getUploadTime(),
                photo.getCommentCount(),
                photo.getReactionCount(),
                photo.getUploader() != null ? photo.getUploader().getUsername() : null,
                photo.getDevice() != null ? photo.getDevice().getId() : null,
                photo.getDevice() != null ? photo.getDevice().getName() : null,
                photo.isVisible(),
                photo.isVisibleForGuest(),
                photo.isWish(),
                isVideo
        );
    }

}
