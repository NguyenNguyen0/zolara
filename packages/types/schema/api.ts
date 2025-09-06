import { z } from 'zod';
import { UserSchema, MinimalUserSchema, FriendListSchema } from './user';
import { ChatSchema } from './chat';
import { MessageSchema } from './message';

// Generic API Response schema
export const ApiResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z.any().optional(),
	error: z.any().optional(),
});

// User API Schemas
export const CreateUserProfileRequestSchema = z.object({
	firstName: z.string().trim().min(1).max(20),
	lastName: z.string().trim().min(1).max(20),
	email: z.email().trim().min(1).max(30),
});

export const CreateUserProfileResponseSchema = ApiResponseSchema.extend({
	data: UserSchema.optional(),
});

export const GetUserProfileResponseSchema = ApiResponseSchema.extend({
	data: UserSchema.optional(),
});

export const UpdateUserProfileRequestSchema = z.object({
	firstName: z.string().trim().min(1).max(20).optional(),
	lastName: z.string().trim().min(1).max(20).optional(),
	bio: z.string().trim().max(100).optional(),
	dob: z
		.string()
		.refine((val) => !isNaN(Date.parse(val)), {
			message: 'Invalid date format. Expected format: YYYY-MM-DD',
		})
		.transform((val) => new Date(val))
		.optional(),
	gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
});

export const UpdateUserProfileResponseSchema = ApiResponseSchema.extend({
	data: UserSchema.optional(),
});

export const ResetPasswordRequestSchema = z.object({
	currentPassword: z.string().trim().min(1),
	newPassword: z.string().trim().min(1).min(8),
});

export const ResetPasswordResponseSchema = ApiResponseSchema;

export const GetFriendListResponseSchema = ApiResponseSchema.extend({
	data: FriendListSchema.optional(),
});

export const AddFriendRequestSchema = z.object({
	friendId: z.string().trim().min(1),
});

export const AddFriendResponseSchema = ApiResponseSchema.extend({
	data: MinimalUserSchema.optional(),
});

export const BlockUserRequestSchema = z.object({
	userId: z.string().trim().min(1),
	isBlocked: z.boolean().default(true),
});

export const BlockUserResponseSchema = ApiResponseSchema;

export const DeleteFriendRequestSchema = z.object({
	friendId: z.string().trim().min(1),
});

export const DeleteFriendResponseSchema = ApiResponseSchema;

// Type definitions
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type CreateUserProfileRequest = z.infer<
	typeof CreateUserProfileRequestSchema
>;
export type CreateUserProfileResponse = z.infer<
	typeof CreateUserProfileResponseSchema
>;
export type GetUserProfileResponse = z.infer<
	typeof GetUserProfileResponseSchema
>;
export type UpdateUserProfileRequest = z.infer<
	typeof UpdateUserProfileRequestSchema
>;
export type UpdateUserProfileResponse = z.infer<
	typeof UpdateUserProfileResponseSchema
>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
export type GetFriendListResponse = z.infer<typeof GetFriendListResponseSchema>;
export type AddFriendRequest = z.infer<typeof AddFriendRequestSchema>;
export type AddFriendResponse = z.infer<typeof AddFriendResponseSchema>;
export type BlockUserRequest = z.infer<typeof BlockUserRequestSchema>;
export type BlockUserResponse = z.infer<typeof BlockUserResponseSchema>;
export type DeleteFriendRequest = z.infer<typeof DeleteFriendRequestSchema>;
export type DeleteFriendResponse = z.infer<typeof DeleteFriendResponseSchema>;
