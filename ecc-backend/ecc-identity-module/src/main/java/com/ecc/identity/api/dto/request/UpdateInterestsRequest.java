package com.ecc.identity.api.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdateInterestsRequest {
    @NotNull(message = "Danh sách chủ đề quan tâm không được để null")
    @Size(max = 5, message = "Chỉ được chọn tối đa 5 chủ đề quan tâm")
    private List<Long> categoryIds;
}