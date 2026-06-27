package com.ecc.community.api.dto.response;

import com.ecc.community.domain.model.ForumCategory;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ForumCategoryResponse {
    private Long id;
    private String name;
    private String description;

    public static ForumCategoryResponse fromEntity(ForumCategory category) {
        return ForumCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}
