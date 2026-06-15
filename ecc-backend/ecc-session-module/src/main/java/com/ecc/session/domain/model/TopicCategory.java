package com.ecc.session.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "topic_categories", uniqueConstraints = {
        @UniqueConstraint(name = "uq_cat_name_type", columnNames = {"name", "type"})
})
@Getter
@Setter
public class TopicCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 30)
    private String type = "INTEREST"; // Mặc định theo tài liệu là CHAT_TOPIC, nhưng dùng INTEREST để test Flow 1.9
}