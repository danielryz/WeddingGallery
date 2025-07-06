package com.weddinggallery.controller;

import com.weddinggallery.model.Photo;
import com.weddinggallery.service.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    @GetMapping
    public List<Photo> getAllPhotos(){
        return photoService.getAllPhotos();
    }

    @PostMapping
    public Photo savePhoto(@RequestBody Photo photo){
        return photoService.savePhoto(photo);
    }

    @DeleteMapping("/{id}")
    public void deletePhoto(@PathVariable Long id){
        photoService.deletePhoto(id);
    }


}
