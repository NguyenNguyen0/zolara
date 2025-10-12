import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';

export default function Notification() {
	const { t } = useTranslation('notification');
	const { isDark } = useTheme();

	return (
		<SafeAreaView edges={['top']} className="flex-1 bg-light-mode dark:bg-dark-mode">
			<StatusBar 
				barStyle={isDark ? 'light-content' : 'dark-content'} 
				backgroundColor={isDark ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE} 
			/>

			{/* Header */}
			<View className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
				<Text className="text-2xl font-bold text-dark-mode dark:text-light-mode">
					{t('title')}
				</Text>
			</View>

			{/* Content */}
			<View className="flex-1 justify-center items-center px-6">
				<Text className="text-gray-500 dark:text-gray-400 text-center">
					{t('content')}
				</Text>
			</View>
		</SafeAreaView>
	);
}
