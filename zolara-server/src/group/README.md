# Module Quản Lý Nhóm (Group Management)

Module này cung cấp các chức năng quản lý nhóm trong ứng dụng, bao gồm tạo nhóm, thêm/xóa thành viên, quản lý vai trò, và tham gia nhóm qua link.

## Cấu trúc Module

```
src/group/
├── dto/                  # Data Transfer Objects
│   ├── add-member.dto.ts
│   ├── create-group.dto.ts
│   ├── group-info.dto.ts
│   ├── initial-members.dto.ts
│   ├── join-group.dto.ts
│   ├── update-group.dto.ts
│   └── index.ts
├── group.controller.ts   # API Controller
├── group.gateway.ts      # WebSocket Gateway
├── group.module.ts       # Module Definition
├── group.service.ts      # Business Logic
├── group-api-tests.postman_collection.json  # Postman Collection
└── README.md             # Documentation
```

## Mô hình dữ liệu

### Group
```typescript
model Group {
  id        String       @id @default(uuid())
  name      String
  creatorId String
  avatarUrl String?
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  members   GroupMember[]
}
```

### GroupMember
```typescript
model GroupMember {
  id        String    @id @default(uuid())
  groupId   String
  userId    String
  role      GroupRole @default(MEMBER)
  addedById String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  group     Group     @relation(fields: [groupId], references: [id])
  user      User      @relation(fields: [userId], references: [id])
}
```

### GroupRole
```typescript
enum GroupRole {
  LEADER
  CO_LEADER
  MEMBER
}
```

## API Endpoints

### Tạo nhóm
- **POST** `/api/v1/groups`
- Tạo một nhóm mới với người tạo là thành viên đầu tiên (LEADER)
- Hỗ trợ thêm các thành viên ban đầu thông qua trường `initialMembers`
- Các user ID được gán sẵn từ file seed.ts

### Lấy thông tin nhóm
- **GET** `/api/v1/groups/:id`
- Lấy thông tin chi tiết của nhóm bao gồm danh sách thành viên

### Cập nhật thông tin nhóm
- **PATCH** `/api/v1/groups/:id`
- Cập nhật tên nhóm

### Xóa nhóm
- **DELETE** `/api/v1/groups/:id`
- Xóa nhóm (chỉ LEADER mới có quyền)

### Thêm thành viên
- **POST** `/api/v1/groups/members`
- Thêm một thành viên mới vào nhóm

### Cập nhật vai trò thành viên
- **PATCH** `/api/v1/groups/:groupId/members/:userId/role`
- Cập nhật vai trò của thành viên trong nhóm

### Xóa thành viên
- **DELETE** `/api/v1/groups/:groupId/members/:userId`
- Xóa thành viên khỏi nhóm

### Rời nhóm
- **POST** `/api/v1/groups/:groupId/leave`
- Thành viên tự rời khỏi nhóm

### Tham gia nhóm qua link
- **POST** `/api/v1/groups/join`
- Tham gia nhóm thông qua link mời

### Lấy thông tin công khai của nhóm
- **GET** `/api/v1/groups/:id/info`
- Lấy thông tin công khai của nhóm

### Cập nhật avatar nhóm
- **PATCH** `/api/v1/groups/:id/avatar`
- Cập nhật ảnh đại diện của nhóm bằng cách tải lên file ảnh trực tiếp
- Sử dụng form-data với trường `file` chứa file ảnh (JPG, PNG)

## Tính năng đặc biệt

### Gán sẵn User ID khi tạo nhóm
- Khi tạo nhóm, có thể gán sẵn các user ID cho các thành viên ban đầu
- User ID được lấy từ file `prisma/seed.ts`
- Người dùng có thể thay đổi thành viên sau khi tạo nhóm

### Quản lý vai trò
- Hỗ trợ 3 vai trò: LEADER, CO_LEADER, MEMBER
- Chỉ LEADER mới có thể thăng cấp thành viên lên CO_LEADER
- LEADER có thể chuyển giao quyền lãnh đạo cho thành viên khác

### Thông báo real-time
- Sử dụng WebSocket để thông báo real-time khi có thay đổi trong nhóm
- Các sự kiện: thêm thành viên, xóa thành viên, thay đổi vai trò, cập nhật thông tin nhóm

## Testing
- Sử dụng Postman Collection để test các API
- Collection bao gồm các test case cho tất cả các chức năng của module
