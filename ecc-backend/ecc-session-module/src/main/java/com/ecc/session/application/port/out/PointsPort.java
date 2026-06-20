package com.ecc.session.application.port.out;

/**
 * Outbound port để trừ điểm thành viên.
 * Được gọi khi member hủy chỗ muộn (trong vòng 2h trước giờ bắt đầu session).
 *
 * Implementation thực tế sẽ nằm trong ecc-gamification-module (chưa có).
 * Hiện tại dùng NoOpPointsAdapter (stub) để không block compile.
 */
public interface PointsPort {

    /**
     * Trừ điểm của member.
     *
     * @param memberId ID của member bị trừ điểm
     * @param points   Số điểm bị trừ (dương)
     * @param reason   Lý do trừ điểm (ví dụ: "LATE_CANCEL")
     */
    void deductPoints(Long memberId, int points, String reason);
}
