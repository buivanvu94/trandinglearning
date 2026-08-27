@echo off
title Trading Masterclass Learning App
chcp 65001 >nul

echo =======================================================
echo    HỌC VIỆN PRICE ACTION, VOLUME PROFILE & CUNG CẦU
echo           Trình duyệt bài giảng 2K Full Tính Năng
echo =======================================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo [1/3] Đang cài đặt thư viện cần thiết...
    call npm install
)

if not exist ".next" (
    echo [2/3] Đang đóng gói ứng dụng (Build Next.js)...
    call npm run build
)

echo [3/3] Đang khởi chạy máy chủ tại http://localhost:4000 ...
echo.
echo =======================================================
echo    Ứng dụng đang chạy tại: http://localhost:4000
echo    Nhấn Ctrl + C để dừng máy chủ khi học xong.
echo =======================================================
echo.

start "" "http://localhost:4000"

node node_modules\next\dist\bin\next start -p 4000
pause
