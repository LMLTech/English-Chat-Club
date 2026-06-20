package com.ecc.session.config;

import com.ecc.identity.infrastructure.security.JwtTokenProvider;
import com.ecc.session.application.port.out.BookingRepositoryPort;
import com.ecc.session.domain.model.Session;
import com.ecc.session.infrastructure.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketJwtInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    // Tiêm thêm 2 Repository để check quyền lúc vào phòng
    private final SessionRepository sessionRepository;
    private final BookingRepositoryPort bookingRepositoryPort;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // 1. VÒNG GỬI XE (CONNECT): Kiểm tra JWT Token có hợp lệ không
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authorization = accessor.getNativeHeader("Authorization");
            if (authorization != null && !authorization.isEmpty()) {
                String token = authorization.get(0).replace("Bearer ", "");
                if (jwtTokenProvider.validateToken(token)) {
                    Long userId = jwtTokenProvider.getUserIdFromToken(token);
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userId, null, null);
                    accessor.setUser(auth);
                } else {
                    log.error("WebSocket JWT Token không hợp lệ");
                    throw new IllegalArgumentException("Token không hợp lệ");
                }
            } else {
                throw new IllegalArgumentException("Thiếu Header Authorization");
            }
        }


        // 2. VÒNG SOÁT VÉ (SUBSCRIBE): Chặn đứng việc nghe lén phòng ảo
        else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();

            // Nếu người dùng đang cố gắng đăng ký nhận tin nhắn của một phòng chat
            if (destination != null && destination.startsWith("/topic/chat/")) {
                try {
                    // Cắt chuỗi để lấy ID phòng ra (VD: /topic/chat/3 -> Lấy số 3)
                    Long sessionId = Long.parseLong(destination.replace("/topic/chat/", ""));

                    // Lấy ID người dùng từ thông tin đã xác thực ở bước CONNECT
                    Long userId = Long.parseLong(accessor.getUser().getName());

                    // Kiểm tra phòng có tồn tại không
                    Session session = sessionRepository.findById(sessionId)
                            .orElseThrow(() -> new IllegalArgumentException("Phòng hội thoại không tồn tại"));

                    // Kiểm tra quyền: Phải là Moderator hoặc có Booking CONFIRMED
                    boolean isModerator = session.getModeratorId().equals(userId);
                    boolean isConfirmedMember = bookingRepositoryPort.findActiveByMemberIdAndSessionId(userId, sessionId).isPresent();

                    if (!isModerator && !isConfirmedMember) {
                        log.warn("User ID: {} cố gắng nghe lén phòng ID: {}", userId, sessionId);
                        throw new IllegalArgumentException("Bạn không có quyền tham gia phòng này");
                    }
                } catch (Exception e) {
                    log.error("Lỗi bảo mật khi Subscribe: {}", e.getMessage());
                    // Quăng Exception để ngắt ngay lập tức gói tin SUBSCRIBE này
                    throw new IllegalArgumentException(e.getMessage());
                }
            }
        }

        return message;
    }
}