package com.weddinggallery.util;

import org.springframework.data.domain.Sort;

public class SortUtil {
    public static Sort from(String sortBy, String direction) {
        String property = "uploadTime";
        if ("commentCount".equalsIgnoreCase(sortBy)) {
            property = "commentCount";
        } else if ("reactionCount".equalsIgnoreCase(sortBy)) {
            property = "reactionCount";
        }
        Sort.Direction dir = Sort.Direction.DESC;
        if (direction != null && direction.equalsIgnoreCase("asc")) {
            dir = Sort.Direction.ASC;
        }
        return Sort.by(dir, property);
    }
}
