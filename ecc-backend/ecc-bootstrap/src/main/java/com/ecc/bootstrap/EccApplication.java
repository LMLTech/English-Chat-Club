package com.ecc.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;

@SpringBootApplication
@ComponentScan("com.ecc")          // Quét tất cả package com.ecc.*
@EntityScan("com.ecc")             // Tìm entity trong com.ecc.*.infrastructure.entity
@EnableJpaRepositories("com.ecc")  // Tìm JPA repository trong com.ecc.*.infrastructure.repository
public class EccApplication {
    public static void main(String[] args) {
        SpringApplication.run(EccApplication.class, args);
    }
    @Bean
    CommandLineRunner startupMessage() {
        return args -> {
            System.out.println("""
                
====================================================
              ENGLISH CHAT CLUB (ECC)
====================================================

 ███████╗ ██████╗ ██████╗
 ██╔════╝██╔════╝██╔════╝
 █████╗  ██║     ██║
 ██╔══╝  ██║     ██║
 ███████╗╚██████╗╚██████╗
 ╚══════╝ ╚═════╝ ╚═════╝

 Backend Status : RUNNING
 Port           : 8080
 Framework      : Spring Boot 3
 Database       : MySQL
 Cache          : Redis

====================================================

""");
        };
    }
}


