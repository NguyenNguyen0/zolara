import { View, FlatList, Alert } from 'react-native';
import { useState } from 'react';
import { MOCK_FRIEND_REQUESTS_RECEIVED, FriendRequest } from '@/src/mocks/friend.request';
import FriendReceiveItem from '@/src/components/item/friend.receive.item';
import { useTranslation } from 'react-i18next';

export default function FriendReceive() {
	const { t } = useTranslation('friend-request');
	const [requests, setRequests] = useState<FriendRequest[]>(MOCK_FRIEND_REQUESTS_RECEIVED);

	const handleAccept = (request: FriendRequest) => {
		console.log('=== ACCEPT FRIEND REQUEST ===');
		console.log('Request ID:', request.id);
		console.log('User:', request.name);
		Alert.alert(t('acceptSuccess'), t('acceptMessage', { name: request.name }));
		setRequests(requests.filter(r => r.id !== request.id));
	};

	const handleReject = (request: FriendRequest) => {
		console.log('=== REJECT FRIEND REQUEST ===');
		console.log('Request ID:', request.id);
		console.log('User:', request.name);
		Alert.alert(t('rejectSuccess'), t('rejectMessage', { name: request.name }));
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
					<FriendReceiveItem
						request={item}
						onAccept={handleAccept}
						onReject={handleReject}
						onPress={handlePress}
					/>
				)}
			/>
		</View>
	);
}
