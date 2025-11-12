export enum FriendRequestStatus {
	PENDING = 'pending',
	ACCEPTED = 'accepted',
	REJECTED = 'rejected',
}

export interface FriendRequest {
	id: string;
	from: string; // User ID who sent the request
	to: string; // User ID who received the request
	message?: string; // Optional message (max 300 chars)
	createdAt: Date;
	updatedAt?: Date;
}

export interface FriendRequestDocument {
	from: string;
	to: string;
	message?: string;
	createdAt: Date;
	updatedAt?: Date;
}

export interface FriendRequestCreateData {
	from: string;
	to: string;
	message?: string;
}

export interface FriendRequestResponse extends FriendRequest {
	fromUser?: any; // Populated user data
	toUser?: any; // Populated user data
}

export interface Friendship {
	id: string;
	userA: string; // Smaller userId (alphabetically)
	userB: string; // Larger userId (alphabetically)
	createdAt: Date;
}

export interface FriendshipDocument {
	userA: string;
	userB: string;
	createdAt: Date;
}

export interface FriendSuggestion {
	user: any; // User data
	mutualFriends: number;
	reason: string;
}
