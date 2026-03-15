@echo off
echo Sedang menjalankan Sistem Akuntan...

:: 1. Buka Jendela Baru untuk BACKEND
:: Ganti path di bawah dengan lokasi folder backend Anda
start "Backend Server" cmd /k "cd /d C:\Users\UIGM - BPT\Desktop\sistem-akuntan\backend && npm run dev"

:: 2. Buka Jendela Baru untuk FRONTEND
:: Ganti path di bawah dengan lokasi folder frontend Anda
start "Frontend Client" cmd /k "cd /d C:\Users\UIGM - BPT\Desktop\sistem-akuntan\frontend && npm run dev"

:: Menutup jendela launcher ini (opsional)
exit