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
import NavigateHeader from '@/src/components/commons/navigate.header';
import NotificationItem, {
	NotificationItemProps,
} from '@/src/components/item/notification.item';
import { APP_COLOR } from '@/src/utils/constants';
import { MOCK_NOTIFICATIONS } from '@/src/mocks/notification';

export default function NotificationTab() {
	const { t } = useTranslation('notification');
	const { isDark } = useTheme();
	const [notifications, setNotifications] =
		useState<NotificationItemProps[]>(MOCK_NOTIFICATIONS);
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
			<NavigateHeader title={t('header')} showSearch />
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
