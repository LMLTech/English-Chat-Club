package com.ecc.community.domain.model.forum;

public enum ContentStatus {
    PENDING,   // Chờ duyệt
    PUBLISHED, // Đã duyệt / Được phép hiển thị
    HIDDEN,    // Bị Admin/Mod ẩn (do vi phạm)
    DELETED    // Xóa mềm (bởi user hoặc admin)
}
