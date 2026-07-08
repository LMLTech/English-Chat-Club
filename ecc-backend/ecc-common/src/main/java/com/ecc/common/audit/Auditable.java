package com.ecc.common.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation đánh dấu các method cần ghi Audit Log.
 * Khi method được gọi, AuditLogAspect sẽ tự động ghi log vào bảng audit_logs.
 *
 * Sử dụng: @Auditable(action = "APPROVE_POST")
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {

    /**
     * Tên hành động (VD: "BAN_USER", "APPROVE_POST", "HIDE_COMMENT").
     */
    String action();

    /**
     * Mô tả ngắn gọn hành động (tuỳ chọn).
     */
    String description() default "";
}
