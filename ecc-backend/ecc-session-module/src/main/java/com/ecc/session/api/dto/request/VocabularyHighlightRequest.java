package com.ecc.session.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VocabularyHighlightRequest {
    @NotNull(message = "sessionId is required")
    private Long sessionId;

    @NotNull(message = "userId is required")
    private Long userId;

    @NotBlank(message = "word is required")
    private String word;

    @NotBlank(message = "meaning is required")
    private String meaning;
}
