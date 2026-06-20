package com.ecc.session.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Cấu hình cho ecc-session-module.
 * @EnableScheduling kích hoạt Spring Scheduling để PromoteConfirmationScheduler hoạt động.
 */
@Configuration
@EnableScheduling
public class SessionModuleConfig {
}
