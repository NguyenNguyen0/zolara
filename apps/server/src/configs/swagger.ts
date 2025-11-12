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
						permissions: {
							type: 'array',
							items: { $ref: '#/components/schemas/Permission' },
						},
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
				FriendRequest: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						from: { type: 'string', description: 'User ID who sent the request' },
						to: { type: 'string', description: 'User ID who received the request' },
						message: { type: 'string', maxLength: 300, nullable: true },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time', nullable: true },
						fromUser: { $ref: '#/components/schemas/User', nullable: true },
						toUser: { $ref: '#/components/schemas/User', nullable: true },
					},
					required: ['id', 'from', 'to', 'createdAt'],
				},
				Friendship: {
					type: 'object',
					properties: {
						friendshipId: { type: 'string' },
						user: { $ref: '#/components/schemas/User' },
						friendsSince: { type: 'string', format: 'date-time' },
					},
				},
				FriendSuggestion: {
					type: 'object',
					properties: {
						user: { $ref: '#/components/schemas/User' },
						mutualFriends: { type: 'number' },
						reason: { type: 'string' },
					},
				},
				Conversation: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						type: { type: 'string', enum: ['direct', 'group'] },
						participants: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									userId: { type: 'string' },
									joinedAt: { type: 'string', format: 'date-time' },
								},
							},
						},
						group: {
							type: 'object',
							nullable: true,
							properties: {
								name: { type: 'string' },
								avatarUrl: { type: 'string', format: 'uri', nullable: true },
								createdBy: { type: 'string' },
							},
						},
						lastMessage: {
							type: 'object',
							nullable: true,
							properties: {
								id: { type: 'string' },
								content: { type: 'string', nullable: true },
								senderId: { type: 'string' },
								createdAt: { type: 'string', format: 'date-time' },
							},
						},
						lastMessageAt: { type: 'string', format: 'date-time', nullable: true },
						seenBy: { type: 'array', items: { type: 'string' } },
						unreadCounts: { type: 'object', additionalProperties: { type: 'number' } },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time', nullable: true },
					},
					required: ['id', 'type', 'participants', 'createdAt'],
				},
				ConversationCreateRequest: {
					type: 'object',
					properties: {
						type: { type: 'string', enum: ['direct', 'group'] },
						participantIds: { type: 'array', items: { type: 'string' }, minItems: 2 },
						groupName: { type: 'string', description: 'Required for group conversations' },
						groupAvatarUrl: { type: 'string', format: 'uri' },
					},
					required: ['type', 'participantIds'],
				},
				ConversationUpdateRequest: {
					type: 'object',
					properties: {
						groupName: { type: 'string' },
						groupAvatarUrl: { type: 'string', format: 'uri' },
					},
				},
				Message: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						conversationId: { type: 'string' },
						senderId: { type: 'string' },
						content: { type: 'string', nullable: true },
						imgUrl: { type: 'string', format: 'uri', nullable: true },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time', nullable: true },
						sender: { $ref: '#/components/schemas/User', nullable: true },
					},
					required: ['id', 'conversationId', 'senderId', 'createdAt'],
				},
				MessageCreateRequest: {
					type: 'object',
					properties: {
						conversationId: { type: 'string' },
						content: { type: 'string', description: 'Required if imgUrl is not provided' },
						imgUrl: { type: 'string', format: 'uri', description: 'Required if content is not provided' },
					},
					required: ['conversationId'],
				},
				MessageUpdateRequest: {
					type: 'object',
					properties: {
						content: { type: 'string' },
						imgUrl: { type: 'string', format: 'uri' },
					},
				},
			},
			responses: {
				BadRequest: {
					description: 'Bad Request',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse',
							},
						},
					},
				},
				Unauthorized: {
					description: 'Unauthorized - Missing or invalid token',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse',
							},
						},
					},
				},
				Forbidden: {
					description: 'Forbidden - Insufficient permissions',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse',
							},
						},
					},
				},
				NotFound: {
					description: 'Resource not found',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse',
							},
						},
					},
				},
			},
		},
		tags: [
			{ name: 'Auth', description: 'Authentication endpoints' },
			{ name: 'Users', description: 'User management endpoints' },
			{ name: 'Permissions', description: 'Permission management endpoints' },
			{ name: 'Roles', description: 'Role management endpoints' },
			{ name: 'Friends', description: 'Friend management endpoints' },
			{ name: 'Conversations', description: 'Conversation management endpoints' },
			{ name: 'Messages', description: 'Message management endpoints' },
		],
	},
	apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJSDoc(options);
