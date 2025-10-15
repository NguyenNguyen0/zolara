import React, { useState } from 'react';
import {
	View,
	Text,
	FlatList,
	RefreshControl,
	ListRenderItem,
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
		userName: 'Toska Nguyễn',
		avatar: 'https://i.pravatar.cc/150?img=1',
		timestamp: '4w',
		isRead: false,
		showActions: true,
	},
	{
		id: '2',
		type: 'add_friend',
		userName: 'Nguyen Huyy',
		avatar: 'https://i.pravatar.cc/150?img=2',
		timestamp: '4w',
		isRead: false,
		showActions: true,
	},
	{
		id: '3',
		type: 'comment',
		userName: 'Hội những người yêu kem Celano',
		message:
			'Hội những người yêu kem Celano commented on HIEUTHUH AI\'s post: "Chắc phải tổ chức cuộc so trình mix k..."',
		avatar: 'https://i.pravatar.cc/150?img=3',
		timestamp: '42m',
		isRead: false,
	},
	{
		id: '4',
		type: 'like',
		userName: 'Đỗ Thành Văn',
		message:
			'Đỗ Thành Văn mentioned you in a comment: "Nguyen Minh mới thấy chị phiên mà"',
		avatar: 'https://i.pravatar.cc/150?img=4',
		timestamp: '3w',
		isRead: true,
	},
	{
		id: '5',
		type: 'invite_group',
		userName: 'Code MeLy',
		message:
			'Code MeLy posted a new reel: "Team IT của Meta có dạng ổn không khi tính năng bị bug đúng lúc sếp đang demo t..."',
		avatar: 'https://i.pravatar.cc/150?img=5',
		timestamp: '3w',
		isRead: true,
	},
	{
		id: '6',
		type: 'birthday',
		userName: 'Nhon Nguyen',
		message: 'Nhon Nguyen mentioned you in a comment',
		avatar: 'https://i.pravatar.cc/150?img=6',
		timestamp: '1w',
		isRead: true,
	},
	{
		id: '7',
		type: 'login',
		message: 'New login detected from Windows PC in Ho Chi Minh City',
		timestamp: '5d',
		isRead: true,
	},
	{
		id: '8',
		type: 'comment',
		userName: 'Theanh28 Entertainment',
		message:
			'Theanh28 Entertainment posted 2 new reels, including "Giọt bia giải sầu cuối đời cù..."',
		avatar: 'https://i.pravatar.cc/150?img=7',
		timestamp: '3d',
		isRead: true,
	},
];

export default function Notification() {
	const { t } = useTranslation('notification');
	const { isDark } = useTheme();
	const [notifications, setNotifications] =
		useState<NotificationItemProps[]>(mockNotifications);
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		// Simulate API call
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	const handleConfirm = (id: string) => {
		console.log('Confirmed:', id);
		// Handle confirm action
		setNotifications((prev) =>
			prev.map((notif) =>
				notif.id === id
					? { ...notif, showActions: false, isRead: true }
					: notif,
			),
		);
	};

	const handleDelete = (id: string) => {
		console.log('Deleted:', id);
		// Handle delete action
		setNotifications((prev) => prev.filter((notif) => notif.id !== id));
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
				onConfirm={() => handleConfirm(item.id)}
				onDelete={() => handleDelete(item.id)}
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
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={
							isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE
						}
					/>
				}
				ListEmptyComponent={renderEmpty}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={
					notifications.length === 0 ? { flex: 1 } : undefined
				}
			/>
		</SafeArea>
	);
}
