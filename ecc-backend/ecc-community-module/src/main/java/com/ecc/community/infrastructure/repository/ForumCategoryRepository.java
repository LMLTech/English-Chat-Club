package com.ecc.community.infrastructure.repository;

import com.ecc.community.domain.model.ForumCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumCategoryRepository extends JpaRepository<ForumCategory, Long> {
    List<ForumCategory> findAllByOrderByDisplayOrderAsc();
    boolean existsByName(String name);
}
