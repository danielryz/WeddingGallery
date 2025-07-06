package com.weddinggallery.service;

import com.weddinggallery.model.Photo;
import com.weddinggallery.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhotoService {
    private final PhotoRepository photoRepository;

    public List<Photo> getAllPhotos(){
        return photoRepository.findAll();
    }

    public Photo savePhoto(Photo photo){
        return photoRepository.save(photo);
    }

    public void deletePhoto(Long id){
        photoRepository.deleteById(id);
    }

}
