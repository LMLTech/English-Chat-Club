package com.ecc.common.util;

public interface BadWordFilter {
    /**
     * Kiểm tra xem chuỗi có chứa từ cấm không
     */
    boolean containsBadWord(String text);

    /**
     * Lọc và thay thế từ cấm thành các ký tự như ***
     */
    String filter(String text);
}