import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import Header from '@/src/components/commons/header';
import { APP_COLOR } from '@/src/utils/constants';

export default function Notification() {
	const { t } = useTranslation('notification');
	const { isDark } = useTheme();

	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<Header showSearch />
			
		</SafeAreaView>
	);
}
