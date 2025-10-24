import NavigateHeader from '@/src/components/commons/navigate.header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import FriendSent from './friend.sent';
import FriendReceive from './friend.receive';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import { MOCK_FRIEND_REQUESTS_RECEIVED, MOCK_FRIEND_REQUESTS_SENT } from '@/src/mocks/friend.request';
import { useTranslation } from 'react-i18next';

export default function FriendRequest() {
	const { isDark } = useTheme();
	const { t } = useTranslation('friend-request');
	const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader
				showBackButton
				title={t('title')}
				showQRScanner
			/>

			{/* Tabs */}
			<View className="flex-row border-b border-gray-200 dark:border-gray-700">
				<TouchableOpacity
					onPress={() => setActiveTab('received')}
					activeOpacity={0.7}
					className="flex-1 py-3 items-center"
					style={{
						borderBottomWidth: activeTab === 'received' ? 2 : 0,
						borderBottomColor: APP_COLOR.PRIMARY,
					}}
				>
					<Text
						className={`text-base font-semibold ${
							activeTab === 'received'
								? 'text-primary'
								: isDark
									? 'text-gray-400'
									: 'text-gray-600'
						}`}
					>
						{t('received')} {MOCK_FRIEND_REQUESTS_RECEIVED.length}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => setActiveTab('sent')}
					activeOpacity={0.7}
					className="flex-1 py-3 items-center"
					style={{
						borderBottomWidth: activeTab === 'sent' ? 2 : 0,
						borderBottomColor: APP_COLOR.PRIMARY,
					}}
				>
					<Text
						className={`text-base font-semibold ${
							activeTab === 'sent'
								? 'text-primary'
								: isDark
									? 'text-gray-400'
									: 'text-gray-600'
						}`}
					>
						{t('sent')} {MOCK_FRIEND_REQUESTS_SENT.length}
					</Text>
				</TouchableOpacity>
			</View>

			{/* Tab Content */}
			{activeTab === 'received' ? <FriendReceive /> : <FriendSent />}
		</SafeAreaView>
	);
}

