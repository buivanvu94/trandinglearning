@echo off
title Trading Masterclass Learning App
chcp 65001 >nul

echo =======================================================
echo    HỌC VIỆN PRICE ACTION, VOLUME PROFILE & CUNG CẦU
echo           Trình duyệt bài giảng 2K Full Tính Năng
echo =======================================================
echo.

cd /d "%~dp0"
if not exist ".env" (
    echo [0/4] Khởi tạo tệp cấu hình .env từ .env.example...
    copy .env.example .env >nul
)

if not exist "node_modules" (
    echo [1/4] Đang cài đặt thư viện cần thiết...
    call npm install
)

echo [2/4] Kiểm tra và khởi tạo cơ sở dữ liệu MySQL...
call npm run db:init

if not exist ".next" (
    echo [3/4] Đang đóng gói ứng dụng (Build Next.js)...
    call npm run build
)

echo [4/4] Đang khởi chạy máy chủ tại http://localhost:4000 ...
echo =======================================================
echo    Ứng dụng đang chạy tại: http://localhost:4000
echo    Nhấn Ctrl + C để dừng máy chủ khi học xong.
echo =======================================================
echo.

start "" "http://localhost:4000"

node node_modules\next\dist\bin\next start -p 4000
pause
