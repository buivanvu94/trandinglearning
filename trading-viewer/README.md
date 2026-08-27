# 🌟 Trading Masterclass Pro — Learning & User Management Platform

Hệ thống Quản trị Học viên (RBAC) và Nền tảng Học tập Phân tích Kỹ thuật chuẩn 2K, thiết kế theo ngôn ngữ **Apple Pro Design System** kết hợp tiêu chuẩn **Impeccable Craft**.

---

## 🚀 Tính Năng Nổi Bật

### 1. Module Quản Trị Người Dùng & Phân Quyền (RBAC)
- **Quy trình Đăng ký & Xét duyệt nghiêm ngặt:**
  - Học viên tự do đăng ký tài khoản tại `/register`.
  - Trạng thái mặc định: **`Pending` (Chờ kích hoạt)**.
  - Người dùng chưa được duyệt sẽ **bị chặn truy cập** và nhận thông báo hướng dẫn liên hệ Admin.
- **Admin Console (`/admin/users`):**
  - KPI Dashboard theo thời gian thực (Chờ duyệt, Đang hoạt động, Đã khóa, Tổng tài khoản).
  - Phím bấm **1-Click Kích hoạt ngay (`[✓ Kích hoạt ngay]`)** hoặc Từ chối (`[✕]`).
  - Chuyển đổi vai trò linh hoạt: `Quản Trị Viên (Admin)` ⇄ `Học Viên (User)`.
  - Đặt lại mật khẩu, chỉnh sửa thông tin, khóa tài khoản hoặc xóa người dùng.

### 2. Module Quản Lý Bài Học & Cơ Chế Import ZIP Tự Động
- **Admin Lessons Manager (`/admin/lessons`):**
  - Quản lý toàn bộ danh mục bài học và slide hình ảnh 2K trong cơ sở dữ liệu MySQL.
  - Sắp xếp thứ tự hiển thị bằng nút điều hướng lên / xuống trực quan.
  - Chỉnh sửa tiêu đề, mô tả và xóa bài giảng.
- **Cơ chế Import Bài Học bằng Thư mục ZIP:**
  - Tải lên tệp `.zip` chứa nhiều hình ảnh biểu đồ.
  - **Tự động nhận diện Tên bài học** từ tên tệp nén (Ví dụ: `15. Thấu hiểu Orderflow và Delta.zip` ➔ Tiêu đề: *15. Thấu hiểu Orderflow và Delta*).
  - **Sắp xếp slide tự nhiên (Natural Alphanumeric Sort):** Đảm bảo thứ tự `slide_01`, `slide_02`, ..., `slide_10` chính xác tuyệt đối.
  - Tự động trích xuất, đo kích thước ảnh 2K và nạp toàn bộ vào MySQL Database trong một transaction an toàn.

### 3. Trải Nghiệm Học Tập Apple Pro (Signature UI)
- **Canvas Đen Tuyệt Đối (#000000) & Apple Slate (#161617)** kết hợp viền mờ frosted glass và màu nhấn Apple Blue (`#2997ff`).
- **3 Chế độ học tập:**
  - *Slide Player:* Trình chiếu slide 2K tập trung cao độ.
  - *Scroll Storyboard:* Cuộn đọc liên tục kèm ghi chú theo từng slide.
  - *Grid Overview:* Xem tổng thể dạng lưới.
- **2K Inspector Lightbox:** Phóng to micro-details biểu đồ đến 400%.
- **Hệ thống Bookmarks & Ghi chú cá nhân hóa.**

---

## 🛠 Cấu Hình Cơ Sở Dữ Liệu MySQL (.env)

Hệ thống kết nối MySQL / MariaDB thông qua tệp cấu hình `.env` tại thư mục gốc của dự án:

```env
# Cấu hình kết nối MySQL / MariaDB
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=trading_db

# Bảo mật JWT & Phiên đăng nhập
JWT_SECRET=trading_masterclass_pro_secret_key_2026_apple_design_impeccable
JWT_EXPIRES_IN=7d

# Tài khoản Admin mặc định khi khởi tạo
ADMIN_DEFAULT_EMAIL=admin@tradingpro.com
ADMIN_DEFAULT_PASSWORD=Admin@123456
ADMIN_DEFAULT_NAME=Quản Trị Viên

# Ứng dụng
NEXT_PUBLIC_APP_NAME="Trading Masterclass Pro"
```

---

## ⚡ Hướng Dẫn Khởi Chạy

### Cách 1: Khởi chạy nhanh bằng File Batch (Khuyên dùng trên Windows)
Chỉ cần nhấp đúp vào file `start.bat` trong thư mục `trading-viewer`. Script sẽ tự động:
1. Tạo `.env` từ `.env.example` nếu chưa có.
2. Cài đặt các gói thư viện.
3. Chạy lệnh tự động khởi tạo bảng và dữ liệu MySQL (`npm run db:init`).
4. Build và mở trình duyệt tại `http://localhost:4000`.

### Cách 2: Khởi chạy thủ công qua Terminal
```bash
# 1. Di chuyển vào thư mục dự án
cd trading-viewer

# 2. Cài đặt dependencies
npm install

# 3. Khởi tạo Database & Seed dữ liệu ban đầu
npm run db:init

# 4. Chạy môi trường Development
npm run dev

# Hoặc Build và chạy Production
npm run build
npm run start
```

---

## 🔑 Tài Khoản Quản Trị Viên Mặc Định (Seed)

| Thuộc tính | Giá trị |
| :--- | :--- |
| **Email đăng nhập** | `admin@tradingpro.com` |
| **Mật khẩu** | `Admin@123456` |
| **Vai trò (Role)** | `Admin` (Toàn quyền quản trị) |
| **Trạng thái (Status)** | `Active` (Đã kích hoạt) |

---

## 📂 Cấu Trúc Mã Nguồn (Modular & Clean)

```
trading-viewer/
├── app/
│   ├── admin/               # Khu vực Quản trị viên
│   │   ├── users/page.tsx   # Quản lý người dùng, duyệt kích hoạt
│   │   ├── lessons/page.tsx # Quản lý bài học & Import ZIP
│   │   └── layout.tsx       # Apple Pro Admin Header & Tabs
│   ├── api/
│   │   ├── auth/            # API Đăng ký, Đăng nhập, Me, Logout
│   │   ├── admin/users/     # API CRUD & duyệt tài khoản người dùng
│   │   ├── admin/lessons/   # API CRUD bài học & Import ZIP
│   │   └── lessons/         # API Lấy danh sách & chi tiết bài học
│   ├── lesson/[id]/page.tsx # Trình chiếu bài giảng 2K
│   ├── login/page.tsx       # Trang Đăng nhập Apple Pro
│   ├── register/page.tsx    # Trang Đăng ký với thông báo Pending
│   ├── page.tsx             # Dashboard khóa học học viên
│   └── layout.tsx           # Root Layout với AuthProvider
├── components/
│   ├── admin/               # Modals Thêm/Sửa User, Upload ZIP
│   ├── Header.tsx           # Thanh điều hướng với Role Badge & Admin Switcher
│   └── Sidebar.tsx          # Danh sách bài học nạp động từ DB
├── contexts/
│   └── AuthContext.tsx      # Quản lý phiên đăng nhập và quyền truy cập
├── lib/
│   ├── db.ts                # MySQL Connection Pool & Transaction
│   ├── db-init.ts           # Schema Migration & Auto Seeders
│   ├── db-lessons.ts        # Database Lesson Service
│   └── auth.ts              # JWT, Password Hashing & Auth Guard
├── middleware.ts            # Route Guard bảo vệ các trang học & admin
└── scripts/
    ├── init-db.mjs          # Script CLI khởi tạo cơ sở dữ liệu
    └── verify-e2e.mjs       # Script kiểm thử E2E tự động toàn diện
```
