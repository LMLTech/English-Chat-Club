package com.ecc.identity.application.listener;

import com.ecc.common.audit.Auditable;
import com.ecc.identity.domain.model.AuditLog;
import com.ecc.identity.infrastructure.repository.AuditLogRepository;
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

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Around("@annotation(auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long actorId = null;
        String actorRole = "UNKNOWN";

        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getName())) {
            try {
                actorId = Long.parseLong(authentication.getName());
            } catch (NumberFormatException e) {
                actorId = -1L;
            }
            actorRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));
        }

        String ipAddress = getClientIpAddress();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String targetMethod = signature.getDeclaringTypeName() + "." + signature.getName();
        String parameters = serializeArgs(joinPoint.getArgs());
        String description = auditable.description().isEmpty() ? auditable.action() : auditable.description();

        Object result;
        String resultStatus = "UNKNOWN";
        String errorDetail = null;

        try {
            result = joinPoint.proceed();
            resultStatus = "SUCCESS";
        } catch (Throwable ex) {
            resultStatus = "FAILURE";
            errorDetail = ex.getClass().getSimpleName() + ": " + ex.getMessage();
            throw ex;
        } finally {
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
                log.error("Lỗi khi ghi Audit Log: {}", e.getMessage());
            }
        }
        return result;
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
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