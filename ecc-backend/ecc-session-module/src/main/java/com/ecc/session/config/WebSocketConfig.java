package com.ecc.session.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketJwtInterceptor webSocketJwtInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Thay dấu "*" bằng các pattern chỉ đích danh môi trường local
        // Cách này cho phép mọi cổng trên localhost (bao gồm cả IntelliJ 63342) đi qua mượt mà
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Tiền tố cho các topic mà client sẽ lắng nghe (ví dụ: /topic/chat/1)
        registry.enableSimpleBroker("/topic", "/queue");
        // Tiền tố cho các message client gửi lên server (ví dụ: /app/chat.sendMessage)
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Gắn "bảo vệ" vào để kiểm tra JWT mỗi khi có người muốn kết nối WebSocket
        registration.interceptors(webSocketJwtInterceptor);
    }
}