package com.weddinggallery.repository;

import com.weddinggallery.model.Photo;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.Set;

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

  public static Specification<Photo> isWish(boolean wish) {
    return (root, query, cb) -> cb.equal(root.get("isWish"), wish);
  }

  public static Specification<Photo> isVisibleForGuest(boolean visible) {
    return (root, query, cb) -> cb.equal(root.get("isVisibleForGuest"), visible);
  }

  public static Specification<Photo> withExtensions(Set<String> extensions) {
    return (root, query, cb) -> {
      if (extensions == null || extensions.isEmpty()) {
        return null;
      }
      var predicates = extensions.stream()
          .map(ext -> cb.like(cb.lower(root.get("fileName")), "%." + ext.toLowerCase()))
          .toArray(Predicate[]::new);
      return cb.or(predicates);
    };
  }
}

