package com.ecc.common.util;

/**
 * Port Interface – Bộ lọc từ cấm (Hexagonal: Outbound Port).
 * Các module (session, community) inject interface này để lọc nội dung,
 * không phụ thuộc vào implementation cụ thể.
 */
public interface BadWordFilter {

    /**
     * Kiểm tra xem chuỗi có chứa từ cấm không.
     *
     * @param text nội dung cần kiểm tra
     * @return true nếu phát hiện từ cấm
     */
    boolean containsBadWord(String text);

    /**
     * Lọc và thay thế từ cấm thành các ký tự che (***).
     *
     * @param text nội dung gốc
     * @return nội dung đã được lọc sạch từ cấm
     */
    String filter(String text);

    /**
     * Reload lại danh sách từ cấm từ nguồn dữ liệu (file / DB).
     * Dùng khi admin cập nhật danh sách từ cấm mà không cần restart server.
     */
    void reload();
}