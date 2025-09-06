import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Zolara API Documentation',
			version: '1.0.0',
			description:
				'This is a REST API application made with Express and documented with Swagger',
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
						email: { type: 'string', format: 'email' },
						firstName: { type: 'string', maxLength: 20 },
						lastName: { type: 'string', maxLength: 20 },
						enable: { type: 'boolean', default: true },
						isOnline: { type: 'boolean', default: false },
						lastSeen: { type: 'string', format: 'date-time' },
						createdAt: { type: 'string', format: 'date-time' },
						role: {
							type: 'string',
							enum: ['admin', 'user'],
							default: 'user',
						},
						dob: {
							type: 'string',
							format: 'date-time',
							nullable: true,
						},
						gender: {
							type: 'string',
							enum: [
								'male',
								'female',
								'other',
								'prefer_not_to_say',
							],
							nullable: true,
						},
						typingTo: { type: 'string', nullable: true },
						bio: { type: 'string', maxLength: 100, nullable: true },
						avatar: {
							type: 'string',
							format: 'uri',
							maxLength: 100,
							nullable: true,
						},
					},
					required: ['id', 'email', 'firstName', 'lastName'],
				},
				MinimalUser: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						firstName: { type: 'string', maxLength: 20 },
						lastName: { type: 'string', maxLength: 20 },
						avatar: {
							type: 'string',
							format: 'uri',
							maxLength: 100,
							nullable: true,
						},
						isOnline: { type: 'boolean', nullable: true },
						lastSeen: {
							type: 'string',
							format: 'date-time',
							nullable: true,
						},
					},
					required: ['id', 'firstName', 'lastName'],
				},
				FriendList: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						ownerId: { type: 'string' },
						count: { type: 'integer', default: 0 },
						friends: {
							type: 'array',
							items: { $ref: '#/components/schemas/MinimalUser' },
						},
					},
					required: ['id', 'ownerId', 'count', 'friends'],
				},
				ApiResponse: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: { type: 'object', nullable: true },
						error: { type: 'object', nullable: true },
					},
					required: ['success', 'message'],
				},
				CreateUserProfileResponse: {
					allOf: [
						{ $ref: '#/components/schemas/ApiResponse' },
						{
							type: 'object',
							properties: {
								data: {
									$ref: '#/components/schemas/User',
									nullable: true,
								},
							},
						},
					],
				},
				GetUserProfileResponse: {
					allOf: [
						{ $ref: '#/components/schemas/ApiResponse' },
						{
							type: 'object',
							properties: {
								data: {
									$ref: '#/components/schemas/User',
									nullable: true,
								},
							},
						},
					],
				},
				UpdateUserProfileRequest: {
					type: 'object',
					properties: {
						firstName: { type: 'string', maxLength: 20 },
						lastName: { type: 'string', maxLength: 20 },
						bio: { type: 'string', maxLength: 100 },
						dob: { type: 'string', format: 'date-time' },
						gender: {
							type: 'string',
							enum: [
								'male',
								'female',
								'other',
								'prefer_not_to_say',
							],
						},
						image: {
							type: 'string',
							format: 'binary',
						},
					},
				},
				UpdateUserProfileResponse: {
					allOf: [
						{ $ref: '#/components/schemas/ApiResponse' },
						{
							type: 'object',
							properties: {
								data: {
									$ref: '#/components/schemas/User',
									nullable: true,
								},
							},
						},
					],
				},
				ResetPasswordRequest: {
					type: 'object',
					properties: {
						currentPassword: { type: 'string' },
						newPassword: { type: 'string', minLength: 8 },
					},
					required: ['currentPassword', 'newPassword'],
				},
				ResetPasswordResponse: {
					$ref: '#/components/schemas/ApiResponse',
				},
				GetFriendListResponse: {
					allOf: [
						{ $ref: '#/components/schemas/ApiResponse' },
						{
							type: 'object',
							properties: {
								data: {
									$ref: '#/components/schemas/FriendList',
									nullable: true,
								},
							},
						},
					],
				},
				AddFriendRequest: {
					type: 'object',
					properties: {
						friendId: { type: 'string' },
					},
					required: ['friendId'],
				},
				AddFriendResponse: {
					allOf: [
						{ $ref: '#/components/schemas/ApiResponse' },
						{
							type: 'object',
							properties: {
								data: {
									$ref: '#/components/schemas/MinimalUser',
									nullable: true,
								},
							},
						},
					],
				},
				BlockUserRequest: {
					type: 'object',
					properties: {
						userId: { type: 'string' },
						isBlocked: { type: 'boolean', default: true },
					},
					required: ['userId'],
				},
				BlockUserResponse: {
					$ref: '#/components/schemas/ApiResponse',
				},
				DeleteFriendResponse: {
					$ref: '#/components/schemas/ApiResponse',
				},
			},
		},
	},
	apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/index.ts'], // Path to the API routes files and main file
};

export const specs = swaggerJSDoc(options);
