import { View, FlatList, Alert } from 'react-native';
import { useState } from 'react';
import { MOCK_FRIEND_REQUESTS_SENT, FriendRequest } from '@/src/mocks/friend.request';
import FriendSentItem from '@/src/components/item/friend.sent.item';

export default function FriendSent() {
	const [requests, setRequests] = useState<FriendRequest[]>(MOCK_FRIEND_REQUESTS_SENT);

	const handleRecall = (request: FriendRequest) => {
		console.log('=== RECALL FRIEND REQUEST ===');
		console.log('Request ID:', request.id);
		console.log('User:', request.name);
		Alert.alert('Đã thu hồi', `Đã thu hồi lời mời kết bạn gửi đến ${request.name}`);
		setRequests(requests.filter(r => r.id !== request.id));
	};

	const handlePress = (request: FriendRequest) => {
		// router.push(`/(screens)/(user)/${request.userId}` as any);
	};

	return (
		<View className="flex-1">
			<FlatList
				data={requests}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<FriendSentItem
						request={item}
						onRecall={handleRecall}
						onPress={handlePress}
					/>
				)}
			/>
		</View>
	);
}
