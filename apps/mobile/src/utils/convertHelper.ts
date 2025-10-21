type ConversationType = 'GROUP' | 'FRIEND' | 'STRANGER';

/**
 * Map conversation type to header status
 */
export const getHeaderStatusFromConversationType = (
	type: ConversationType
): 'stranger' | 'friend' | 'friend_request' => {
	switch (type) {
		case 'GROUP':
		case 'FRIEND':
			return 'friend';
		case 'STRANGER':
			return 'friend_request';
		default:
			return 'stranger';
	}
};

/**
 * Get online status text based on conversation type and member count
 */
export const getOnlineStatusText = (
	type: ConversationType,
	memberCount: number
): string => {
	if (type === 'GROUP') {
		return `${memberCount} members`;
	}
	if (type === 'FRIEND') {
		return 'Online Just Now';
	}
	return '';
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (date: Date): string => {
	return date.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
};

/**
 * Format time for message bubble
 */
export const formatMessageTime = (date: Date): string => {
	return date.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
};

/**
 * Get status text for conversation header
 */
export const getStatusText = (
	status: 'stranger' | 'friend' | 'friend_request',
	isGroup: boolean,
	onlineStatus?: string
): string => {
	if (isGroup) {
		return onlineStatus || '';
	}

	switch (status) {
		case 'stranger':
			return 'STRANGER';
		case 'friend':
			return onlineStatus || 'Online';
		case 'friend_request':
			return 'STRANGER';
		default:
			return '';
	}
};

/**
 * Get status badge color
 */
export const getStatusColor = (
	status: 'stranger' | 'friend' | 'friend_request',
	isGroup: boolean
): string => {
	if (isGroup) {
		return 'bg-gray-500';
	}

	switch (status) {
		case 'stranger':
		case 'friend_request':
			return 'bg-blue-500';
		case 'friend':
			return 'bg-green-500';
		default:
			return 'bg-blue-500';
	}
};
