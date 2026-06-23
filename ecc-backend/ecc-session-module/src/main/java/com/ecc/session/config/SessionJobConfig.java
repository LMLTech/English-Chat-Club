package com.ecc.session.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SessionJobConfig {
    // Kích hoạt động cơ chạy ngầm Cron Job cho toàn bộ module Session
}