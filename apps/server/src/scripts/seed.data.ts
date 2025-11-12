import { auth, db, testFirebaseConnection } from '../configs/firebase';
import { Permission, Role } from '../types';
import { Timestamp } from 'firebase-admin/firestore';

// Permission data based on the API table
const permissions: Omit<Permission, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[] = [
	// USER module
	{ apiPath: '/api/users', method: 'GET', module: 'USER', name: 'Lấy danh sách User', active: true },
	{ apiPath: '/api/users/{id}', method: 'GET', module: 'USER', name: 'Tìm User theo id', active: true },
	{ apiPath: '/api/users', method: 'POST', module: 'USER', name: 'Tạo User', active: true },
	{ apiPath: '/api/users/{id}', method: 'PUT', module: 'USER', name: 'Cập nhật User', active: true },
	{ apiPath: '/api/users/{id}', method: 'DELETE', module: 'USER', name: 'Xóa User theo id', active: true },
	{ apiPath: '/api/users/{id}/role', method: 'PATCH', module: 'USER', name: 'Cập nhật Role của User', active: true },
	{ apiPath: '/api/users/{id}/active', method: 'PATCH', module: 'USER', name: 'Khoá/Mở khóa tài khoản User', active: true },

	// AUTH module
	{ apiPath: '/api/auth/signup', method: 'POST', module: 'AUTH', name: 'Đăng ký tài khoản', active: true },
	{ apiPath: '/api/auth/login', method: 'POST', module: 'AUTH', name: 'Đăng nhập', active: true },
	{ apiPath: '/api/auth/verify', method: 'POST', module: 'AUTH', name: 'Xác thực token', active: true },
	{ apiPath: '/api/auth/refresh', method: 'POST', module: 'AUTH', name: 'Làm mới token', active: true },
	{ apiPath: '/api/auth/me', method: 'GET', module: 'AUTH', name: 'Lấy thông tin user hiện tại', active: true },

	// ACCESS-CONTROLLER module - Roles
	{ apiPath: '/api/roles', method: 'GET', module: 'ACCESS-CONTROLLER', name: 'Lấy danh sách Role', active: true },
	{ apiPath: '/api/roles/{id}', method: 'GET', module: 'ACCESS-CONTROLLER', name: 'Tìm Role theo id', active: true },
	{ apiPath: '/api/roles', method: 'POST', module: 'ACCESS-CONTROLLER', name: 'Tạo Role', active: true },
	{ apiPath: '/api/roles/{id}', method: 'PUT', module: 'ACCESS-CONTROLLER', name: 'Cập nhật Role', active: true },
	{ apiPath: '/api/roles/{id}', method: 'DELETE', module: 'ACCESS-CONTROLLER', name: 'Xóa Role theo id', active: true },
	{ apiPath: '/api/roles/{id}/permissions', method: 'PATCH', module: 'ACCESS-CONTROLLER', name: 'Cập nhật quyền cho Role', active: true },

	// ACCESS-CONTROLLER module - Permissions
	{ apiPath: '/api/permissions', method: 'GET', module: 'ACCESS-CONTROLLER', name: 'Lấy danh sách Permission', active: true },
	{ apiPath: '/api/permissions/{id}', method: 'GET', module: 'ACCESS-CONTROLLER', name: 'Tìm Permission theo id', active: true },
	{ apiPath: '/api/permissions', method: 'POST', module: 'ACCESS-CONTROLLER', name: 'Tạo Permission', active: true },
	{ apiPath: '/api/permissions/{id}', method: 'PUT', module: 'ACCESS-CONTROLLER', name: 'Cập nhật Permission', active: true },
	{ apiPath: '/api/permissions/{id}', method: 'DELETE', module: 'ACCESS-CONTROLLER', name: 'Xóa Permission theo id', active: true },

	// FRIEND module
	{ apiPath: '/api/friends', method: 'POST', module: 'FRIEND', name: 'Gửi lời mời kết bạn', active: true },
	{ apiPath: '/api/friends/{requestId}', method: 'PUT', module: 'FRIEND', name: 'Chấp nhận/Từ chối lời mời kết bạn', active: true },
	{ apiPath: '/api/friends', method: 'GET', module: 'FRIEND', name: 'Lấy danh sách bạn bè', active: true },
	{ apiPath: '/api/friends/requests', method: 'GET', module: 'FRIEND', name: 'Lấy danh sách lời mời kết bạn nhận được', active: true },
	{ apiPath: '/api/friends/sent', method: 'GET', module: 'FRIEND', name: 'Lấy danh sách lời mời kết bạn đã gửi', active: true },
	{ apiPath: '/api/friends/{friendId}', method: 'DELETE', module: 'FRIEND', name: 'Xóa bạn bè', active: true },
	{ apiPath: '/api/friends/requests/{requestId}', method: 'DELETE', module: 'FRIEND', name: 'Huỷ lời mời kết bạn đã gửi', active: true },
	{ apiPath: '/api/friends/suggestions', method: 'GET', module: 'FRIEND', name: 'Lấy gợi ý kết bạn', active: true },

	// CONVERSATION module
	{ apiPath: '/api/conversations', method: 'POST', module: 'CONVERSATION', name: 'Tạo cuộc trò chuyện', active: true },
	{ apiPath: '/api/conversations', method: 'GET', module: 'CONVERSATION', name: 'Lấy danh sách cuộc trò chuyện', active: true },
	{ apiPath: '/api/conversations/{id}', method: 'GET', module: 'CONVERSATION', name: 'Lấy chi tiết cuộc trò chuyện', active: true },
	{ apiPath: '/api/conversations/{id}', method: 'PUT', module: 'CONVERSATION', name: 'Cập nhật cuộc trò chuyện', active: true },
	{ apiPath: '/api/conversations/{id}', method: 'DELETE', module: 'CONVERSATION', name: 'Xóa cuộc trò chuyện', active: true },
	{ apiPath: '/api/conversations/{id}/seen', method: 'PATCH', module: 'CONVERSATION', name: 'Đánh dấu đã xem', active: true },
	{ apiPath: '/api/conversations/{id}/participants', method: 'POST', module: 'CONVERSATION', name: 'Thêm thành viên vào nhóm', active: true },
	{ apiPath: '/api/conversations/{id}/participants/{userId}', method: 'DELETE', module: 'CONVERSATION', name: 'Xóa thành viên khỏi nhóm', active: true },
	{ apiPath: '/api/conversations/{conversationId}/messages', method: 'GET', module: 'CONVERSATION', name: 'Lấy tin nhắn trong cuộc trò chuyện', active: true },

	// MESSAGE module
	{ apiPath: '/api/messages', method: 'POST', module: 'MESSAGE', name: 'Gửi tin nhắn', active: true },
	{ apiPath: '/api/messages/{id}', method: 'GET', module: 'MESSAGE', name: 'Lấy chi tiết tin nhắn', active: true },
	{ apiPath: '/api/messages/{id}', method: 'PUT', module: 'MESSAGE', name: 'Chỉnh sửa tin nhắn', active: true },
	{ apiPath: '/api/messages/{id}', method: 'DELETE', module: 'MESSAGE', name: 'Xóa tin nhắn', active: true },
];

// Role data - using numeric IDs as in SQL (stored as string in Firestore)
const roles: Omit<Role, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'permissionIds'>[] = [
	{
		name: 'ADMIN',
		description: 'Chức vụ quản trị toàn bộ hệ thống',
		active: true,
	},
	{
		name: 'USER',
		description: 'Người dùng bình thường, được cấp quyền tối thiểu',
		active: true,
	},
];

// Admin users to create
const adminUsers = [
	{
		email: 'admin@gmail.com',
		password: '123456',
	},
	{
		email: 'nvminh162@gmail.com',
		password: 'zolaranvminh162',
	},
	{
		email: 'trungnguyenwork123@gmail.com',
		password: '123456',
	},
];

// Regular user to create (with USER role)
const regularUsers = [
	{
		email: 'user@gmail.com',
		password: '123456',
	},
];

// Permission IDs mapping (will be set after permissions are created)
// ADMIN gets all permissions
// USER gets basic permissions (auth, view own profile)

export const seedData = async (adminUserId?: string): Promise<void> => {
	await testFirebaseConnection();

	try {
		console.log('🌱 Starting to seed permissions, roles, and admin users...');

		const createdBy = adminUserId || 'system';

		// Step 1: Seed Permissions
		const permissionsSnapshot = await db.collection('permissions').limit(1).get();
		let permissionIds: string[] = [];
		let permissionMap: Map<string, string> = new Map();

		if (!permissionsSnapshot.empty) {
			console.log('⏭️  Permissions collection already has data, skipping...');
			// Get existing permissions for role mapping
			const allPermissionsSnapshot = await db.collection('permissions').get();
			allPermissionsSnapshot.docs.forEach((doc) => {
				const data = doc.data();
				permissionIds.push(doc.id);
				permissionMap.set(`${data.apiPath}:${data.method}`, doc.id);
			});
		} else {
			console.log('📝 Seeding permissions...');
			for (const permission of permissions) {
				const now = new Date();
				const docRef = db.collection('permissions').doc();
				await docRef.set({
					...permission,
					createdAt: Timestamp.fromDate(now),
					createdBy,
					updatedAt: Timestamp.fromDate(now),
					updatedBy: createdBy,
				});
				permissionIds.push(docRef.id);
				permissionMap.set(`${permission.apiPath}:${permission.method}`, docRef.id);
				console.log(`  ✓ Created permission: ${permission.name} (${docRef.id})`);
			}
		}

		// Step 2: Seed Roles with permission mappings
		const rolesSnapshot = await db.collection('roles').limit(1).get();
		if (!rolesSnapshot.empty) {
			console.log('⏭️  Roles collection already has data, skipping...');
		} else {
			console.log('👥 Seeding roles...');

			// Define permission assignments for each role
			const rolePermissions: Record<string, string[]> = {
				ADMIN: permissionIds, // Admin gets all permissions
				USER: [
					// Basic auth permissions
					permissionMap.get('/api/auth/signup:POST') || '',
					permissionMap.get('/api/auth/login:POST') || '',
					permissionMap.get('/api/auth/verify:POST') || '',
					permissionMap.get('/api/auth/refresh:POST') || '',
					permissionMap.get('/api/auth/me:GET') || '',
					// View own profile
					permissionMap.get('/api/users/{id}:GET') || '',
					// Update own profile
					permissionMap.get('/api/users/{id}:PUT') || '',
					// Friend permissions
					permissionMap.get('/api/friends:POST') || '',
					permissionMap.get('/api/friends/{requestId}:PUT') || '',
					permissionMap.get('/api/friends:GET') || '',
					permissionMap.get('/api/friends/requests:GET') || '',
					permissionMap.get('/api/friends/sent:GET') || '',
					permissionMap.get('/api/friends/{friendId}:DELETE') || '',
					permissionMap.get('/api/friends/requests/{requestId}:DELETE') || '',
					permissionMap.get('/api/friends/suggestions:GET') || '',
					// Conversation permissions
					permissionMap.get('/api/conversations:POST') || '',
					permissionMap.get('/api/conversations:GET') || '',
					permissionMap.get('/api/conversations/{id}:GET') || '',
					permissionMap.get('/api/conversations/{id}:PUT') || '',
					permissionMap.get('/api/conversations/{id}:DELETE') || '',
					permissionMap.get('/api/conversations/{id}/seen:PATCH') || '',
					permissionMap.get('/api/conversations/{id}/participants:POST') || '',
					permissionMap.get('/api/conversations/{id}/participants/{userId}:DELETE') || '',
					permissionMap.get('/api/conversations/{conversationId}/messages:GET') || '',
					// Message permissions
					permissionMap.get('/api/messages:POST') || '',
					permissionMap.get('/api/messages/{id}:GET') || '',
					permissionMap.get('/api/messages/{id}:PUT') || '',
					permissionMap.get('/api/messages/{id}:DELETE') || '',
				].filter((id) => id !== ''),
			};

			for (const role of roles) {
				const rolePermissionIds = rolePermissions[role.name] || [];
				const now = new Date();
				const docRef = db.collection('roles').doc();
				await docRef.set({
					...role,
					permissionIds: rolePermissionIds,
					createdAt: Timestamp.fromDate(now),
					createdBy,
					updatedAt: Timestamp.fromDate(now),
					updatedBy: createdBy,
				});
				console.log(`  ✓ Created role: ${role.name} (${docRef.id})`);
			}
		}

		// Step 3: Get ADMIN role ID for admin users
		const adminRoleSnapshot = await db.collection('roles').where('name', '==', 'ADMIN').limit(1).get();
		if (adminRoleSnapshot.empty) {
			console.error('  ❌ ADMIN role not found. Cannot create admin users.');
		} else {
			const adminRoleId = adminRoleSnapshot.docs[0].id;
			const adminRoleName = adminRoleSnapshot.docs[0].data().name;

			// Step 4: Seed Admin Users
			console.log('👤 Seeding admin users...');
			for (const adminUser of adminUsers) {
				try {
					// Check if user already exists by email
					let userRecord;
					try {
						userRecord = await auth.getUserByEmail(adminUser.email);
						console.log(`  ⏭️  User already exists: ${adminUser.email}`);
					} catch (error: any) {
						if (error.code === 'auth/user-not-found') {
							// Create user in Firebase Auth
							userRecord = await auth.createUser({
								email: adminUser.email,
								password: adminUser.password,
								emailVerified: true,
							});
							console.log(`  ✓ Created Firebase Auth user: ${adminUser.email}`);
						} else {
							throw error;
						}
					}

					// Check if user profile exists in Firestore
					const userDoc = await db.collection('users').doc(userRecord.uid).get();

					if (!userDoc.exists) {
						// Create user profile in Firestore with ADMIN roleId
						// Note: id is document ID, not a field in the document
						const nowDate = new Date();
						const userProfile = {
							email: userRecord.email,
							firstName: '',
							lastName: '',
							isLocked: false,
							isActive: false,
							lastActivity: Timestamp.fromDate(nowDate),
							createdAt: Timestamp.fromDate(nowDate),
							createdBy: 'system',
							updatedAt: Timestamp.fromDate(nowDate),
							updatedBy: 'system',
							roleId: adminRoleId, // Set roleId instead of role name
							dob: null,
							gender: null,
							bio: null,
							avatar: null,
						};

						await db.collection('users').doc(userRecord.uid).set(userProfile);

						// Set custom claims in Firebase Auth (keep role name for backward compatibility)
						await auth.setCustomUserClaims(userRecord.uid, { role: adminRoleName });

						console.log(`  ✓ Created admin user profile: ${adminUser.email} (${userRecord.uid}) with roleId: ${adminRoleId}`);
					} else {
						// Update existing user to ensure they have ADMIN roleId
						const existingData = userDoc.data();
						if (existingData?.roleId !== adminRoleId) {
							await db.collection('users').doc(userRecord.uid).update({
								roleId: adminRoleId,
								updatedAt: Timestamp.fromDate(new Date()),
								updatedBy: 'system',
							});
							await auth.setCustomUserClaims(userRecord.uid, { role: adminRoleName });
							console.log(`  ✓ Updated user to ADMIN roleId: ${adminUser.email}`);
						} else {
							console.log(`  ⏭️  User already has ADMIN roleId: ${adminUser.email}`);
						}
					}
				} catch (error: any) {
					console.error(`  ❌ Error creating admin user ${adminUser.email}:`, error.message);
					// Continue with other users even if one fails
				}
			}
		}

		// Step 5: Seed Regular Users (USER role)
		const userRoleSnapshot = await db.collection('roles').where('name', '==', 'USER').limit(1).get();
		if (userRoleSnapshot.empty) {
			console.error('  ❌ USER role not found. Cannot create regular users.');
		} else {
			const userRoleId = userRoleSnapshot.docs[0].id;
			const userRoleName = userRoleSnapshot.docs[0].data().name;

			console.log('👤 Seeding regular users...');
			for (const regularUser of regularUsers) {
				try {
					// Check if user already exists by email
					let userRecord;
					try {
						userRecord = await auth.getUserByEmail(regularUser.email);
						console.log(`  ⏭️  User already exists: ${regularUser.email}`);
					} catch (error: any) {
						if (error.code === 'auth/user-not-found') {
							// Create user in Firebase Auth
							userRecord = await auth.createUser({
								email: regularUser.email,
								password: regularUser.password,
								emailVerified: true,
							});
							console.log(`  ✓ Created Firebase Auth user: ${regularUser.email}`);
						} else {
							throw error;
						}
					}

					// Check if user profile exists in Firestore
					const userDoc = await db.collection('users').doc(userRecord.uid).get();

					if (!userDoc.exists) {
						// Create user profile in Firestore with USER roleId
						// Note: id is document ID, not a field in the document
						const nowDate = new Date();
						const userProfile = {
							email: userRecord.email,
							firstName: '',
							lastName: '',
							isLocked: false,
							isActive: false,
							lastActivity: Timestamp.fromDate(nowDate),
							createdAt: Timestamp.fromDate(nowDate),
							createdBy: 'system',
							updatedAt: Timestamp.fromDate(nowDate),
							updatedBy: 'system',
							roleId: userRoleId, // Set roleId for USER role
							dob: null,
							gender: null,
							bio: null,
							avatar: null,
						};

						await db.collection('users').doc(userRecord.uid).set(userProfile);

						// Set custom claims in Firebase Auth
						await auth.setCustomUserClaims(userRecord.uid, { role: userRoleName });

						console.log(`  ✓ Created regular user profile: ${regularUser.email} (${userRecord.uid}) with roleId: ${userRoleId}`);
					} else {
						// Update existing user to ensure they have USER roleId
						const existingData = userDoc.data();
						if (existingData?.roleId !== userRoleId) {
							await db.collection('users').doc(userRecord.uid).update({
								roleId: userRoleId,
								updatedAt: Timestamp.fromDate(new Date()),
								updatedBy: 'system',
							});
							await auth.setCustomUserClaims(userRecord.uid, { role: userRoleName });
							console.log(`  ✓ Updated user to USER roleId: ${regularUser.email}`);
						} else {
							console.log(`  ⏭️  User already has USER roleId: ${regularUser.email}`);
						}
					}
				} catch (error: any) {
					console.error(`  ❌ Error creating regular user ${regularUser.email}:`, error.message);
					// Continue with other users even if one fails
				}
			}
		}

		console.log('✅ Seeding completed successfully!');
		console.log(`   - Permissions: ${permissionIds.length}`);
		console.log(`   - Roles: ${roles.length}`);
		console.log(`   - Admin Users: ${adminUsers.length}`);
		console.log(`   - Regular Users: ${regularUsers.length}`);
	} catch (error: any) {
		console.error('❌ Error seeding permissions and roles:', error);
		throw error;
	}
};

// Run seeder if executed directly
if (require.main === module) {
	seedData()
		.then(() => {
			console.log('Seeder completed');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Seeder failed:', error);
			process.exit(1);
		});
}

