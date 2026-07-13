package com.ecc.identity.infrastructure.security;

import io.github.bucket4j.Bucket;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Refill;
import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RateLimitFilter implements Filter {

    // Map lưu Bucket cho từng IP (Trong Production nên dùng Redis thay vì Map)
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        // Giới hạn: 500 requests mỗi 1 phút cho mỗi IP (Tăng cho môi trường Dev)
        return Bucket.builder()
                .addLimit(Bandwidth.classic(500, Refill.intervally(500, Duration.ofMinutes(1))))
                .build();
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String ip = httpRequest.getRemoteAddr();

        Bucket bucket = cache.computeIfAbsent(ip, k -> createNewBucket());

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.getWriter().write("Quá nhiều yêu cầu. Vui lòng thử lại sau!");
        }
    }
}