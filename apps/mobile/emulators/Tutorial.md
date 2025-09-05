# Firebase Emulator Setup Guide

## Hướng dẫn thiết lập Firebase Emulator cho React Native & Web

### Bước 1: Cài đặt Firebase CLI

```bash
npm i -g firebase-tools
```

### Bước 2: Đăng nhập Firebase

```bash
firebase login
```

<!-- Next step 4: đã tạo -->
<!-- ### Bước 3: Khởi tạo Firebase (Chỉ cần làm 1 lần)

```bash
# Nếu chưa khởi tạo project
firebase init

# Chọn:
# - Firestore: Configure rules and indexes files
# - Emulators: Set up local emulators
``` -->

### Bước 4: Khởi động Firebase Emulator

```bash
firebase emulators:start
```

## Cấu hình Emulator

### Ports được sử dụng:
- **Auth Emulator**: `9099`
- **Firestore Emulator**: `9098`
- **Emulator UI**: `4000` (default)

### Truy cập Emulator UI:
- Web: http://localhost:4000

## Cấu hình trong ứng dụng

### Firebase Config (firebase.ts):
- **Web**: Kết nối tới `localhost:9099`
- **Android Emulator**: Kết nối tới `10.0.2.2:9099`
- **iOS Simulator**: Kết nối tới `localhost:9099`

## Troubleshooting

### Lỗi thường gặp:

1. **"auth/network-request-failed"**
   - Kiểm tra Firebase Emulator có đang chạy không
   - Đảm bảo sử dụng đúng IP address cho platform

2. **"auth/emulator-config-failed"**
   - Khởi động lại Firebase Emulator
   - Kiểm tra port 9099 không bị chiếm dụng

3. **Không kết nối được trên Android**
   - Sử dụng `10.0.2.2` thay vì `localhost`
   - Kiểm tra Android emulator network settings

### Kiểm tra trạng thái Emulator:

```bash
# Kiểm tra ports đang sử dụng
netstat -an | findstr :9099
netstat -an | findstr :9098

# Dừng emulator
Ctrl + C

# Khởi động lại
firebase emulators:start
```

## Development Workflow

1. Khởi động Firebase Emulator trước
2. Chạy React Native app
3. Test authentication & database operations
4. Dữ liệu sẽ được reset khi restart emulator

## Production vs Development

- **Development**: Tự động kết nối emulator khi `__DEV__ = true`
- **Production**: Kết nối Firebase production server

## Lưu ý quan trọng

⚠️ **Chỉ sử dụng emulator trong development**
⚠️ **Dữ liệu trong emulator sẽ mất khi restart**
⚠️ **Không commit firebase-debug.log vào git**