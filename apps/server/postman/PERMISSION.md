# Permission System Documentation

## Tổng quan

Hệ thống sử dụng Role-Based Access Control (RBAC) với 2 roles chính:
- **ADMIN**: Quản trị viên, có toàn quyền truy cập
- **USER**: Người dùng thông thường, có quyền hạn giới hạn

## Roles và Permissions

### ADMIN Role

Role ADMIN có **toàn quyền truy cập** tất cả các API endpoints trong hệ thống.

**Quyền hạn:**
- ✅ Quản lý toàn bộ users (xem, tạo, sửa, xóa)
- ✅ Quản lý roles (xem, tạo, sửa, xóa, gán permissions)
- ✅ Quản lý permissions (xem, tạo, sửa, xóa)
- ✅ Cập nhật role của users
- ✅ Khoá/mở khóa tài khoản users
- ✅ Tất cả các chức năng của USER role

### USER Role

Role USER có **quyền hạn giới hạn**, chỉ có thể:
- ✅ Đăng ký tài khoản (signup)
- ✅ Đăng nhập (login)
- ✅ Xác thực token (verify)
- ✅ Làm mới token (refresh)
- ✅ Xem thông tin tài khoản của chính mình (me)
- ✅ Xem thông tin profile của chính mình (GET /api/users/{id} - chỉ id của mình)
- ✅ Cập nhật profile của chính mình (PUT /api/users/{id} - chỉ id của mình)

**Không có quyền:**
- ❌ Xem danh sách tất cả users
- ❌ Tạo/sửa/xóa users khác
- ❌ Quản lý roles
- ❌ Quản lý permissions
- ❌ Cập nhật role của users
- ❌ Khoá/mở khóa tài khoản

## API Endpoints và Permissions

### Authentication APIs (`/api/auth`)

| Endpoint | Method | ADMIN | USER | Mô tả |
|----------|--------|-------|------|-------|
| `/api/auth/signup` | POST | ✅ | ✅ | Đăng ký tài khoản mới |
| `/api/auth/login` | POST | ✅ | ✅ | Đăng nhập |
| `/api/auth/verify` | POST | ✅ | ✅ | Xác thực token |
| `/api/auth/refresh` | POST | ✅ | ✅ | Làm mới token |
| `/api/auth/me` | GET | ✅ | ✅ | Lấy thông tin user hiện tại (yêu cầu authentication) |

### User Management APIs (`/api/users`)

| Endpoint | Method | ADMIN | USER | Mô tả |
|----------|--------|-------|------|-------|
| `/api/users` | GET | ✅ | ❌ | Lấy danh sách tất cả users (Admin only) |
| `/api/users/{id}` | GET | ✅ | ✅* | Xem thông tin user (User chỉ xem được chính mình) |
| `/api/users` | POST | ✅ | ❌ | Tạo user mới (Admin only) |
| `/api/users/{id}` | PUT | ✅ | ✅* | Cập nhật user (User chỉ cập nhật được chính mình, không thể sửa `enable` và `active`) |
| `/api/users/{id}` | DELETE | ✅ | ❌ | Xóa user (Admin only) |
| `/api/users/{id}/role` | PATCH | ✅ | ❌ | Cập nhật role của user (Admin only) |
| `/api/users/{id}/active` | PATCH | ✅ | ❌ | Khoá/mở khóa tài khoản (Admin only) |

**Lưu ý:** 
- `*` USER chỉ có thể thao tác với tài khoản của chính mình (id phải trùng với `req.user.uid`)
- Khi USER cập nhật profile, không thể sửa các trường `enable` và `active` (chỉ ADMIN mới có quyền)

### Role Management APIs (`/api/roles`)

| Endpoint | Method | ADMIN | USER | Mô tả |
|----------|--------|-------|------|-------|
| `/api/roles` | GET | ✅ | ❌ | Lấy danh sách tất cả roles (Admin only) |
| `/api/roles/{id}` | GET | ✅ | ❌ | Xem thông tin role (Admin only) |
| `/api/roles` | POST | ✅ | ❌ | Tạo role mới (Admin only) |
| `/api/roles/{id}` | PUT | ✅ | ❌ | Cập nhật role (Admin only) |
| `/api/roles/{id}` | DELETE | ✅ | ❌ | Xóa role (Admin only) |
| `/api/roles/{id}/permissions` | PATCH | ✅ | ❌ | Cập nhật permissions cho role (Admin only) |

### Permission Management APIs (`/api/permissions`)

| Endpoint | Method | ADMIN | USER | Mô tả |
|----------|--------|-------|------|-------|
| `/api/permissions` | GET | ✅ | ❌ | Lấy danh sách tất cả permissions (Admin only) |
| `/api/permissions/{id}` | GET | ✅ | ❌ | Xem thông tin permission (Admin only) |
| `/api/permissions` | POST | ✅ | ❌ | Tạo permission mới (Admin only) |
| `/api/permissions/{id}` | PUT | ✅ | ❌ | Cập nhật permission (Admin only) |
| `/api/permissions/{id}` | DELETE | ✅ | ❌ | Xóa permission (Admin only) |

## Permission Modules

Hệ thống phân chia permissions theo các modules:

1. **AUTH**: Authentication & Authorization
   - Signup, Login, Verify, Refresh, Me

2. **USER**: User Management
   - CRUD operations trên users
   - Role assignment
   - Account activation/deactivation

3. **ACCESS-CONTROLLER**: Access Control Management
   - Role management
   - Permission management

## Default Accounts

### Admin Accounts
Các tài khoản admin mặc định (được seed khi server khởi động):

1. `admin@gmail.com` / `zolaraadmin`
2. `nvminh162@gmail.com` / `zolaranvminh162`
3. `trungnguyenwork123@gmail.com` / `admintrungnguyenwork123`

### Regular User Account
Tài khoản user mặc định:

1. `user@gmail.com` / `zolarauser`

## Middleware Protection

### `verifyAuth`
- Xác thực token và gắn thông tin user vào `req.user`
- Kiểm tra tài khoản có bị khóa (`active: false`) hay không
- Yêu cầu: Bearer token trong header `Authorization: Bearer <token>`

### `requireAdmin`
- Kiểm tra user có role `ADMIN` hay không
- Trả về lỗi 403 nếu không phải admin
- Sử dụng sau `verifyAuth`

### `requirePermission`
- Kiểm tra user có permission cụ thể hay không (dựa trên API path và HTTP method)
- Admin tự động có tất cả permissions
- Sử dụng sau `verifyAuth`

## Permission Structure

Mỗi permission có cấu trúc:
```typescript
{
  id: string;              // Firestore document ID
  apiPath: string;         // API path (e.g., "/api/users", "/api/users/{id}")
  method: string;          // HTTP method (GET, POST, PUT, DELETE, PATCH)
  module: string;          // Module name (AUTH, USER, ACCESS-CONTROLLER)
  name: string;            // Vietnamese name
  active: boolean;         // Active status
  createdAt: string;       // Creation timestamp
  createdBy: string;       // Creator ID
  updatedAt?: string;      // Update timestamp (optional)
  updatedBy?: string;      // Updater ID (optional)
}
```

## Role Structure

Mỗi role có cấu trúc:
```typescript
{
  id: string;              // Firestore document ID
  name: string;            // Role name (ADMIN, USER)
  description: string;     // Vietnamese description
  permissionIds: string[]; // Array of permission IDs
  active: boolean;         // Active status
  createdAt: string;       // Creation timestamp
  createdBy: string;       // Creator ID
  updatedAt?: string;      // Update timestamp (optional)
  updatedBy?: string;      // Updater ID (optional)
}
```

## Error Responses

Khi không có quyền truy cập, hệ thống trả về:

```json
{
  "type": "https://api.zolara.com/problems/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "Access denied",
  "code": "FORBIDDEN",
  "traceId": "..."
}
```

## Notes

1. **Admin bypass**: Role ADMIN tự động có quyền truy cập tất cả APIs, không cần kiểm tra permission cụ thể.

2. **Self-service**: USER có thể xem và cập nhật profile của chính mình, nhưng không thể:
   - Sửa `enable` và `active` fields
   - Xem danh sách users khác
   - Thao tác với users khác

3. **Permission-based access**: Hệ thống hỗ trợ kiểm tra permission dựa trên API path và HTTP method, cho phép mở rộng linh hoạt trong tương lai.

4. **Account status**: 
   - `active: false` - Tài khoản bị khóa, không thể đăng nhập (trừ ADMIN)
   - `enable: false` - Tắt các tính năng của user (do admin quản lý)

5. **Token types**: 
   - ID Token: Token từ Firebase Auth (sau khi login bằng Firebase Client SDK)
   - Custom Token: Token được tạo bởi server (dùng để exchange lấy ID token)

