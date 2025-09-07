import { z } from 'zod';

export const UserSchema = z.object({
	id: z.string(),
	email: z.email().trim().nonempty().max(30),
	firstName: z.string().trim().nonempty().max(20),
	lastName: z.string().trim().nonempty().max(20),
	enable: z.boolean().default(true),
	isOnline: z.boolean().default(false),
	lastSeen: z.date().default(new Date()),
	createdAt: z.date().default(new Date()),
	role: z.enum(['admin', 'user']).default('user'),
	dob: z.date().optional(),
	gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
	typingTo: z.string().optional(),
	bio: z.string().trim().max(100).optional(),
	avatar: z.url().max(100).optional(),
});

export const MinimalUserSchema = z.object({
	id: z.string(),
	firstName: z.string().trim().nonempty().max(20),
	lastName: z.string().trim().nonempty().max(20),
	avatar: z.url().max(100).optional(),
	isOnline: z.boolean().optional(),
	lastSeen: z.date().optional(),
});

export const FriendListSchema = z.object({
	id: z.string(),
	ownerId: z.string(),
	count: z.int().default(0),
	friends: z.array(MinimalUserSchema),
});

export const BlockUserListSchema = z.object({
	id: z.string(),
	ownerId: z.string(),
	count: z.int().min(0).default(0),
	blockedUsers: z.array(
		z.object({
			userId: z.string(),
			blockedAt: z.date().default(new Date()),
		}),
	),
});

export const InvitationSchema = z.object({
	id: z.string(),
	timestamp: z.date().default(new Date()),
	senderId: z.string(),
	receiverId: z.string(),
	content: z.string(),
	status: z.enum(['pending', 'accepted', 'rejected']),
	type: z.enum(['friend', 'group']),
	groupId: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type MinimalUser = z.infer<typeof MinimalUserSchema>;
export type FriendList = z.infer<typeof FriendListSchema>;
export type BlockUserList = z.infer<typeof BlockUserListSchema>;
export type Invitation = z.infer<typeof InvitationSchema>;
