import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Zolara API Documentation',
			version: '1.0.0',
			description: 'REST API application made with Express and documented with Swagger',
		},
		servers: [
			{
				url: 'http://localhost:3000',
				description: 'Development server',
			},
		],
		components: {
			securitySchemes: {
				BearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
			schemas: {
				User: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						uid: { type: 'string' },
						email: { type: 'string', format: 'email' },
						firstName: { type: 'string', maxLength: 20 },
						lastName: { type: 'string', maxLength: 20 },
						isLocked: { type: 'boolean', default: false },
						isActive: { type: 'boolean', default: false },
						lastActivity: { type: 'string', format: 'date-time' },
						roleId: { type: 'string', nullable: true },
						roleName: { type: 'string' },
						role: { type: 'object', nullable: true },
						createdAt: { type: 'string', format: 'date-time' },
						createdBy: { type: 'string' },
						updatedAt: { type: 'string', format: 'date-time', nullable: true },
						updatedBy: { type: 'string', nullable: true },
						dob: { type: 'string', format: 'date-time', nullable: true },
						gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer_not_to_say'], nullable: true },
						bio: { type: 'string', maxLength: 100, nullable: true },
						avatar: { type: 'string', format: 'uri', maxLength: 100, nullable: true },
						emailVerified: { type: 'boolean', nullable: true },
					},
					required: ['id', 'email', 'firstName', 'lastName'],
				},
				AuthRequest: {
					type: 'object',
					properties: {
						email: { type: 'string', format: 'email' },
						password: { type: 'string', minLength: 6 },
					},
					required: ['email', 'password'],
				},
				SignupResponse: {
					type: 'object',
					properties: {
						id: { type: 'string', description: 'User ID (Firestore document ID)' },
						email: { type: 'string' },
						roleId: { type: 'string', nullable: true },
						roleName: { type: 'string' },
					},
					required: ['id', 'email', 'roleId', 'roleName'],
				},
				AuthResponse: {
					type: 'object',
					properties: {
						id: { type: 'string', description: 'User ID (Firestore document ID)' },
						email: { type: 'string' },
						accessToken: { type: 'string', description: 'JWT access token' },
						roleId: { type: 'string', nullable: true },
						roleName: { type: 'string' },
					},
					required: ['id', 'email', 'accessToken', 'roleId', 'roleName'],
				},
				RefreshTokenResponse: {
					type: 'object',
					properties: {
						accessToken: { type: 'string', description: 'JWT access token' },
					},
					required: ['accessToken'],
				},
				RefreshTokenRequest: {
					type: 'object',
					properties: {
						uid: { type: 'string' },
					},
					required: ['uid'],
				},
				UserUpdateRequest: {
					type: 'object',
					properties: {
						firstName: { type: 'string', maxLength: 20 },
						lastName: { type: 'string', maxLength: 20 },
						bio: { type: 'string', maxLength: 100 },
						dob: { type: 'string', format: 'date-time', nullable: true },
						gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer_not_to_say'], nullable: true },
						avatar: { type: 'string', format: 'uri', nullable: true },
						isLocked: { type: 'boolean' },
					},
				},
				UpdateRoleRequest: {
					type: 'object',
					properties: {
						roleId: { type: 'string' },
					},
					required: ['roleId'],
				},
				ToggleLockRequest: {
					type: 'object',
					properties: {
						isLocked: { type: 'boolean' },
					},
					required: ['isLocked'],
				},
				Permission: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						apiPath: { type: 'string' },
						method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
						module: { type: 'string' },
						name: { type: 'string' },
						active: { type: 'boolean' },
						createdAt: { type: 'string', format: 'date-time' },
						createdBy: { type: 'string' },
						updatedAt: { type: 'string', format: 'date-time', nullable: true },
						updatedBy: { type: 'string', nullable: true },
					},
					required: ['apiPath', 'method', 'module', 'name'],
				},
				PermissionCreateRequest: {
					type: 'object',
					properties: {
						apiPath: { type: 'string' },
						method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
						module: { type: 'string' },
						name: { type: 'string' },
						active: { type: 'boolean', default: true },
					},
					required: ['apiPath', 'method', 'module', 'name'],
				},
				PermissionUpdateRequest: {
					type: 'object',
					properties: {
						apiPath: { type: 'string' },
						method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
						module: { type: 'string' },
						name: { type: 'string' },
						active: { type: 'boolean' },
					},
				},
				Role: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						name: { type: 'string' },
						description: { type: 'string' },
						permissionIds: { type: 'array', items: { type: 'string' } },
						active: { type: 'boolean' },
						createdAt: { type: 'string', format: 'date-time' },
						createdBy: { type: 'string' },
						updatedAt: { type: 'string', format: 'date-time', nullable: true },
						updatedBy: { type: 'string', nullable: true },
					},
					required: ['name', 'description'],
				},
				RoleCreateRequest: {
					type: 'object',
					properties: {
						name: { type: 'string' },
						description: { type: 'string' },
						permissionIds: { type: 'array', items: { type: 'string' } },
						active: { type: 'boolean', default: true },
					},
					required: ['name', 'description'],
				},
				RoleUpdateRequest: {
					type: 'object',
					properties: {
						name: { type: 'string' },
						description: { type: 'string' },
						permissionIds: { type: 'array', items: { type: 'string' } },
						active: { type: 'boolean' },
					},
				},
				UpdateRolePermissionsRequest: {
					type: 'object',
					properties: {
						permissionIds: { type: 'array', items: { type: 'string' } },
					},
					required: ['permissionIds'],
				},
				ErrorResponse: {
					type: 'object',
					properties: {
						type: { type: 'string' },
						title: { type: 'string' },
						status: { type: 'number' },
						detail: { type: 'string' },
						instance: { type: 'string' },
						traceId: { type: 'string' },
						code: { type: 'string' },
						errors: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									field: { type: 'string' },
									code: { type: 'string' },
									message: { type: 'string' },
								},
							},
						},
					},
				},
				SuccessResponse: {
					type: 'object',
					properties: {
						data: { type: 'object' },
						meta: { type: 'object' },
						links: { type: 'object' },
						traceId: { type: 'string' },
					},
				},
				PaginationMeta: {
					type: 'object',
					properties: {
						total: { type: 'number' },
						page: { type: 'number' },
						pageSize: { type: 'number' },
					},
				},
			},
		},
	},
	apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJSDoc(options);
