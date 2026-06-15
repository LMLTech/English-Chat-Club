package com.ecc.session.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_interests")
@IdClass(UserInterestId.class)
@Getter
@Setter
public class UserInterest {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @Id
    @Column(name = "category_id")
    private Long categoryId;
}