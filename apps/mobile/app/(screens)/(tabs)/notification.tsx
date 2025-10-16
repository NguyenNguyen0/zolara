import React, { useState } from 'react';
import {
	View,
	Text,
	FlatList,
	RefreshControl,
	ListRenderItem,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView as SafeArea } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import Header from '@/src/components/commons/header';
import NotificationItem, {
	NotificationItemProps,
} from '@/src/components/item/notification.item';
import { APP_COLOR } from '@/src/utils/constants';

const mockNotifications: NotificationItemProps[] = [
	{
		id: '1',
		type: 'add_friend',
		actor: {
			name: 'Toska Nguyễn',
			avatar: 'https://i.pravatar.cc/150?img=1',
			verified: true,
		},
		content: 'sent you a friend request',
		timestamp: '4w',
		isRead: false,
	},
	{
		id: '2',
		type: 'add_friend',
		actor: {
			name: 'Nguyen Huyy',
			avatar: 'https://i.pravatar.cc/150?img=2',
			verified: true,
		},
		content: 'sent you a friend request',
		timestamp: '4w',
		isRead: false,
	},
	{
		id: '3',
		type: 'comment',
		actor: {
			name: 'Hội những người yêu kem Celano',
			avatar: 'https://i.pravatar.cc/150?img=3',
			verified: false,
		},
		content: 'commented on HIEUTHUHAI\'s post: "Chắc phải tổ chức cuộc so trình mix"',
		timestamp: '42m',
		isRead: false,
	},
	{
		id: '4',
		type: 'mention',
		actor: {
			name: 'Yasuo',
			avatar: 'https://i.pravatar.cc/150?img=4',
			verified: false,
		},
		content: 'mentioned you in a comment: "Nguyen Minh mới thấy chị phiên mà"',
		timestamp: '3w',
		isRead: true,
	},
	{
		id: '5',
		type: 'post',
		actor: {
			name: 'Code MeLy',
			avatar: 'https://i.pravatar.cc/150?img=5',
			verified: false,
		},
		content: 'posted a new reel: "Team IT của Meta có dạng ổn không khi tính năng bị bug đúng lúc sếp đang demo t..."',
		timestamp: '3w',
		isRead: true,
	},
	{
		id: '6',
		type: 'mention',
		actor: {
			name: 'Nhon Nguyen',
			avatar: 'https://i.pravatar.cc/150?img=6',
			verified: true,
		},
		content: 'mentioned you in a comment',
		timestamp: '1w',
		isRead: true,
	},
	{
		id: '7',
		type: 'login',
		content: 'New login detected from Windows PC in Ho Chi Minh City',
		timestamp: '5d',
		isRead: true,
	},
	{
		id: '8',
		type: 'post',
		actor: {
			name: 'Theanh28 Entertainment',
			avatar: 'https://i.pravatar.cc/150?img=7',
			verified: false,
		},
		content: 'posted 2 new reels, including "Giọt bia giải sầu cuối đời cù..."',
		timestamp: '3d',
		isRead: true,
	},
];

export default function NotificationTab() {
	const { t } = useTranslation('notification');
	const { isDark } = useTheme();
	const [notifications, setNotifications] =
		useState<NotificationItemProps[]>(mockNotifications);
	const [refreshing, setRefreshing] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		// Simulate API call
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	const handleLoadMore = () => {
		if (!isLoadingMore) {
			setIsLoadingMore(true);
			// Simulate API call to load more notifications
			setTimeout(() => {
				setIsLoadingMore(false);
			}, 2000);
		}
	};

	const handlePress = (id: string) => {
		console.log('Pressed:', id);
		// Mark as read and navigate
		setNotifications((prev) =>
			prev.map((notif) =>
				notif.id === id ? { ...notif, isRead: true } : notif,
			),
		);
	};

	const renderItem: ListRenderItem<NotificationItemProps> = ({ item }) => {
		return (
			<NotificationItem
				{...item}
				onPress={() => handlePress(item.id)}
			/>
		);
	};

	const renderEmpty = () => (
		<View className="flex-1 items-center justify-center py-20">
			<Text className="text-gray-500 dark:text-gray-400 text-center">
				{t('content')}
			</Text>
		</View>
	);

	const renderFooter = () => {
		if (!isLoadingMore) return null;
		return (
			<View className="py-4 items-center justify-center">
				<ActivityIndicator
					size="small"
					color={APP_COLOR.PRIMARY}
					animating={true}
				/>
			</View>
		);
	};

	return (
		<SafeArea
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<Header title={t('header')} showSearch showMenu />
			<FlatList
				data={notifications}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				ListEmptyComponent={renderEmpty}
				ListFooterComponent={renderFooter}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.5}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={
							isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE
						}
					/>
				}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={
					notifications.length === 0 ? { flex: 1 } : undefined
				}
			/>
		</SafeArea>
	);
}
