package com.ecc.identity.infrastructure.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Kích hoạt CORS
                .csrf(AbstractHttpConfigurer::disable) // Tắt CSRF vì mình dùng JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Không dùng session cookie
                .authorizeHttpRequests(auth -> auth
                        // 1. Mở khóa các API công khai
                        .requestMatchers("/api/auth/**").permitAll()

                        // 2. Mở khóa giao diện Swagger UI và API Docs
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // 3. Mở khóa Callback (Dành cho Google Calendar / OAuth2)
                        .requestMatchers("/callback").permitAll()

                        // 4. Mở khóa Endpoint WebSocket cho phép SockJS thăm dò trước khi kết nối STOMP
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/files/**", "/uploads/**").permitAll()

                        // Bắt buộc xác thực với TẤT CẢ các API còn lại
                        .anyRequest().authenticated()
                )
                // Thêm JwtAuthenticationFilter TRƯỚC UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Cấu hình CORS chuẩn chỉ cho Frontend (Next.js/React/Vue) và Postman
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Dùng Pattern thay vì AllowedOrigins để tương thích hoàn toàn với AllowCredentials
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));

        // BẮT BUỘC có dòng này thì SockJS (WebSocket) mới chịu kết nối mà không văng lỗi CORS
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}