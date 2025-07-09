package com.weddinggallery.repository;

import com.weddinggallery.model.Photo;
import org.springframework.data.jpa.domain.Specification;

public class PhotoSpecifications {
  public static Specification<Photo> withUploaderId(Long uploaderId) {
    return (root, query, cb) ->
        uploaderId == null ? null : cb.equal(root.get("uploader").get("id"), uploaderId);
  }

  public static Specification<Photo> withDeviceId(Long deviceId) {
    return (root, query, cb) ->
        deviceId == null ? null : cb.equal(root.get("device").get("id"), deviceId);
  }

  public static Specification<Photo> isVisible(boolean visible) {
    return (root, query, cb) -> cb.equal(root.get("visible"), visible);
  }
}

