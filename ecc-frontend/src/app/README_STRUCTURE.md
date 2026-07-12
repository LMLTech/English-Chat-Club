# Cấu Trúc Thư Mục Frontend (English Chat Club)

Dự án này sử dụng Next.js App Router. Để code gọn gàng, chúng ta sử dụng **Route Groups** (Các thư mục có dấu ngoặc đơn `()`) để nhóm các trang có chung layout hoặc chung mục đích phân quyền mà không làm thay đổi URL.

## Các Nhóm Chính:

### 1. `(auth)` - Dành cho Khách (Guest)
Chứa các trang dành cho người dùng chưa đăng nhập.
- `/login`: Đăng nhập
- `/register`: Đăng ký
- `/forgot-password`: Quên mật khẩu
- `/reset-password`: Đặt lại mật khẩu
- `/verify-email`: Xác thực Email

### 2. `(main)` - Dành cho Học viên (Member)
Chứa các trang chính của hệ thống dành cho Member đã đăng nhập.
- `/dashboard`: Bảng điều khiển chính
- `/profile`: Hồ sơ cá nhân
- `/friends`: Bạn bè
- `/messages`: Tin nhắn trực tiếp
- `/sessions`: Phòng học
- `/gamification`: Điểm số & Xếp hạng

### 3. `(admin)` - Dành cho Quản trị viên (Admin)
Tất cả các trang quản trị dành riêng cho Admin (Phải có Role `ADMIN`).
- `/admin/dashboard`: Thống kê tổng quan
- `/admin/users`: Quản lý người dùng
- `/admin/sessions`: Quản lý & Duyệt phòng học
- `/admin/topics`: Quản lý chủ đề
- `/admin/events`: Quản lý sự kiện
- `/admin/support`: Hỗ trợ khách hàng
- `/admin/marketing`: Gửi Email Marketing

### 4. `moderator` - Dành cho Người điều phối (Moderator)
Chứa các trang để Moderator quản lý phòng dạy học của mình.
- `/moderator/dashboard`: Tạo phòng mới
- `/moderator/rooms`: Phòng đang chờ duyệt / đang diễn ra
- `/moderator/history`: Lịch sử phòng đã dạy
- `/moderator/reviews`: Đánh giá từ Member
- `/moderator/profile`: Hồ sơ Moderator

---
**💡 Lưu ý:** 
- Middleware (`src/proxy.ts`) sẽ tự động kiểm tra xem người dùng thuộc Role nào (Member, Moderator hay Admin) để bảo vệ các thư mục này, không cho phép truy cập trái phép.
- Nếu bạn đang ở trang dành cho Member nhưng đăng nhập bằng tài khoản Admin, bạn có thể gặp lỗi 403. Vui lòng đăng nhập đúng tài khoản.
