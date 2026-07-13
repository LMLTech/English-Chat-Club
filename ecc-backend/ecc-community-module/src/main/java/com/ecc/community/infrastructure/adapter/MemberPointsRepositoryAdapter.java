package com.ecc.community.infrastructure.adapter;

import com.ecc.community.application.port.out.MemberPointsPort;
import com.ecc.community.domain.model.MemberPoints;
import com.ecc.community.infrastructure.repository.MemberPointsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;

@Component
@RequiredArgsConstructor
public class MemberPointsRepositoryAdapter implements MemberPointsPort {

    private final MemberPointsRepository repository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public Optional<MemberPoints> findByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public MemberPoints save(MemberPoints memberPoints) {
        return repository.save(memberPoints);
    }

    @Override
    public java.util.List<MemberPoints> findTopMembersByPointsDesc(int limit) {
        return repository.findTopMembersByPointsDesc(org.springframework.data.domain.PageRequest.of(0, limit));
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> findTopMembersWithUserDetails(int limit) {
        String sql = "SELECT m.user_id as userId, m.total_points as totalPoints, m.current_level as currentLevel, u.email as username, u.avatar_url as avatarUrl " +
                     "FROM member_points m JOIN users u ON m.user_id = u.id ORDER BY m.total_points DESC LIMIT ?";
        return jdbcTemplate.queryForList(sql, limit);
    }
}