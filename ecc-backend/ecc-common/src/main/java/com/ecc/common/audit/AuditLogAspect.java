package com.ecc.common.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * AOP Aspect – Tự động ghi Audit Log khi method được đánh dấu @Auditable được gọi.
 *
 * Cách hoạt động:
 * 1. Intercept method có @Auditable.
 * 2. Lấy thông tin admin từ SecurityContext (userId, role).
 * 3. Lấy IP từ HttpServletRequest.
 * 4. Ghi log VÀO DB (bảng audit_logs) bất kể thành công hay thất bại.
 * 5. Không chặn flow gốc – nếu method gốc throw exception thì vẫn throw lại.
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Around("@annotation(auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        // 1. Lấy thông tin người thực hiện từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long actorId = null;
        String actorRole = "UNKNOWN";

        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getName())) {
            try {
                actorId = Long.parseLong(authentication.getName());
            } catch (NumberFormatException e) {
                actorId = -1L; // Trường hợp principal không phải userId
            }

            actorRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));
        }

        // 2. Lấy IP address
        String ipAddress = getClientIpAddress();

        // 3. Lấy thông tin method
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String targetMethod = signature.getDeclaringTypeName() + "." + signature.getName();

        // 4. Serialize tham số (giới hạn độ dài để tránh quá tải DB)
        String parameters = serializeArgs(joinPoint.getArgs());

        // 5. Mô tả
        String description = auditable.description().isEmpty()
                ? auditable.action()
                : auditable.description();

        // 6. Thực thi method gốc
        Object result;
        String resultStatus = "UNKNOWN";
        String errorDetail = null;

        try {
            result = joinPoint.proceed();
            resultStatus = "SUCCESS";
        } catch (Throwable ex) {
            resultStatus = "FAILURE";
            errorDetail = ex.getClass().getSimpleName() + ": " + ex.getMessage();
            // Log rồi throw lại để không chặn flow
            throw ex;
        } finally {
            // 7. Ghi audit log vào DB (bất kể thành công hay thất bại)
            try {
                AuditLog auditLog = AuditLog.builder()
                        .actorId(actorId != null ? actorId : -1L)
                        .actorRole(actorRole)
                        .action(auditable.action())
                        .description(description)
                        .targetMethod(targetMethod)
                        .parameters(parameters)
                        .result(resultStatus)
                        .errorDetail(errorDetail)
                        .ipAddress(ipAddress)
                        .timestamp(LocalDateTime.now())
                        .build();

                auditLogRepository.save(auditLog);

                log.info("AUDIT | {} | Actor: {} ({}) | Method: {} | Result: {} | IP: {}",
                        auditable.action(), actorId, actorRole, targetMethod, resultStatus, ipAddress);
            } catch (Exception e) {
                // Không để lỗi ghi audit làm crash ứng dụng
                log.error("Lỗi khi ghi Audit Log: {}", e.getMessage());
            }
        }

        return result;
    }

    /**
     * Lấy IP client từ HttpServletRequest, hỗ trợ proxy (X-Forwarded-For).
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            log.debug("Không lấy được IP: {}", e.getMessage());
        }
        return "unknown";
    }

    /**
     * Serialize tham số method thành chuỗi, giới hạn 500 ký tự.
     * Bỏ qua các tham số nhạy cảm (Authentication, HttpServletRequest).
     */
    private String serializeArgs(Object[] args) {
        if (args == null || args.length == 0) return "[]";

        try {
            Object[] safeArgs = Arrays.stream(args)
                    .map(arg -> {
                        if (arg instanceof Authentication) return "[Authentication]";
                        if (arg instanceof HttpServletRequest) return "[HttpServletRequest]";
                        return arg;
                    })
                    .toArray();

            String json = objectMapper.writeValueAsString(safeArgs);
            return json.length() > 500 ? json.substring(0, 500) + "..." : json;
        } catch (Exception e) {
            return Arrays.toString(args);
        }
    }
}
