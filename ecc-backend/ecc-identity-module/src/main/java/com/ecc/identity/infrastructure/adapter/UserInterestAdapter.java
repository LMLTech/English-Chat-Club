package com.ecc.identity.infrastructure.adapter;

import com.ecc.identity.application.port.out.UserInterestRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserInterestAdapter implements UserInterestRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public List<Long> getInterestCategoryIds(Long userId) {
        String sql = "SELECT category_id FROM user_interests WHERE user_id = ?";
        return jdbcTemplate.queryForList(sql, Long.class, userId);
    }

    @Override
    @Transactional
    public void updateInterests(Long userId, List<Long> categoryIds) {
        // 1. Xóa toàn bộ sở thích cũ của user
        String deleteSql = "DELETE FROM user_interests WHERE user_id = ?";
        jdbcTemplate.update(deleteSql, userId);

        // 2. Thêm danh sách sở thích mới
        if (categoryIds != null && !categoryIds.isEmpty()) {
            String insertSql = "INSERT INTO user_interests (user_id, category_id) VALUES (?, ?)";
            jdbcTemplate.batchUpdate(insertSql, new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws SQLException {
                    ps.setLong(1, userId);
                    ps.setLong(2, categoryIds.get(i));
                }

                @Override
                public int getBatchSize() {
                    return categoryIds.size();
                }
            });
        }
    }
}