import { z } from 'zod';

export const MessageSchema = z.object({
	id: z.string(),
	chatId: z.string(),
	type: z.literal('message').default('message'),
	messageType: z.enum(['text', 'image', 'file', 'sticker']).default('text'),
	content: z.union([z.string().min(1).max(500).trim(), z.url().max(100)]),
	senderId: z.string().nonempty(),
	senderName: z.string().optional(),
	deliveryStatus: z
		.enum(['sending', 'sent', 'delivered', 'read'])
		.default('sending'),
	timestamp: z.date().default(new Date()),
	replyTo: z.string().optional(),
	mentions: z.array(z.string()).optional(),
	isRemoved: z.boolean().default(false),
});

export const CallSchema = z.object({
	id: z.string(),
	callerId: z.string(),
	calleeIds: z.string().array().min(1),
	type: z.literal('call').default('call'),
	callType: z.enum(['voice', 'video']),
	channel: z.string().nonempty(),
	timestamp: z.date().default(new Date()),
	isMissed: z.boolean().default(false),
	duration: z.int().min(0).default(0),
});

export type Message = z.infer<typeof MessageSchema>;
export type Call = z.infer<typeof CallSchema>;
