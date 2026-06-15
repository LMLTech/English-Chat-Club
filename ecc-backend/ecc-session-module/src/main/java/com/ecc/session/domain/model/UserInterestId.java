package com.ecc.session.domain.model;

import lombok.Data;
import java.io.Serializable;

@Data
public class UserInterestId implements Serializable {
    private Long userId;
    private Long categoryId;
}