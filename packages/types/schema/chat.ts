import { z } from 'zod';
import { MinimalUserSchema } from './user';
import { CallSchema, MessageSchema } from './message';

export const GroupConfigSchema = z.object({
	autoMemberApproval: z.boolean().default(true),
});

export type GroupConfig = z.infer<typeof GroupConfigSchema>;

export const GroupSchema = z.object({
	id: z.string(),
	name: z.string().max(30).trim().nonempty(),
	avatar: z.url().max(100).optional(),
	createdAt: z.date().default(new Date()),
	adminId: z.string(),
	subAdminIds: z.array(z.string()).optional(),
	memberCount: z.int().min(2),
	memberIds: z.array(z.string()).min(2).max(100),
	members: z.array(MinimalUserSchema).min(2).max(100).optional(),
	groupConfig: GroupConfigSchema.default({ autoMemberApproval: true }),
});

export const ChatSchema = z.object({
	id: z.string(),
	type: z.enum(['peer', 'group']),
	lastUpdate: z.date().default(new Date()),
	participantIds: z.array(z.string()).min(2).max(2).optional(),
	pinnedContent: z.array(MessageSchema).default([]),
	messages: z.array(z.union([MessageSchema, CallSchema])).default([]),
});

export type Group = z.infer<typeof GroupSchema>;
export type Chat = z.infer<typeof ChatSchema>;
