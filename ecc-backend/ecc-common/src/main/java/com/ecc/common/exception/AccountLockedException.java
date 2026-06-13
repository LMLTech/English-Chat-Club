package com.ecc.common.exception;

// Exception dùng khi tài khoản bị khóa tạm thời hoặc khóa do vi phạm
public class AccountLockedException extends BaseException {

    // Khởi tạo exception với mã lỗi 423 (Locked)
    public AccountLockedException(String message) {
        super(423, message);
    }
}