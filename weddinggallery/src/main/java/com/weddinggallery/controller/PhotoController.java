package com.weddinggallery.controller;

import com.weddinggallery.model.Photo;
import com.weddinggallery.service.PhotoService;
import jakarta.servlet.http.HttpServletRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    @Operation(summary = "Save a photo")
    public Photo savePhoto(@RequestBody Photo photo, HttpServletRequest request){
        return photoService.savePhoto(photo, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete photo by id")
    public void deletePhoto(@PathVariable Long id, HttpServletRequest request){
        photoService.deletePhoto(id, request);
    }


}
