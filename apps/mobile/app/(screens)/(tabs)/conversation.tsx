import { APP_COLOR } from '@/src/utils/constants';
import React, { useEffect, useMemo, useState } from 'react';
import {
	View,
	FlatList,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConversationItem from '@/src/components/item/convervation.item';
import NavigateHeader from '@/src/components/commons/navigate.header';
import { useTranslation } from 'react-i18next';
import { MOCK_CONVERSATION_LIST } from '@/src/mocks/conversationList';

export default function ConversationTab() {
	const { t } = useTranslation('conversations');
	// const [currentPage, setCurrentPage] = useState<number>(1);
	// const [pageSize, setPageSize] = useState<number>(5);
	// TODO: Xoá sau này dùng redux thay thế
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleEndReached = async () => {
		if (!isLoading) {
			setIsLoading(true);
			// setCurrentPage((prev) => prev + 1);
			setTimeout(() => {
				setIsLoading(false);
			}, 3000);
		}
	};
	const fetchInitData = async () => {
		setIsLoading(true);
		// call api from axios (demo 2s)
		setTimeout(() => {
			setIsLoading(false);
		}, 2000);
	};
	useEffect(() => {
		fetchInitData();
	}, []);

	const data = useMemo(() => MOCK_CONVERSATION_LIST, []);

	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader title={t('header')} showSearch showQRScanner showCreateGroup />
			<FlatList
				data={data}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <ConversationItem item={item} />}
				className="flex-1"
				onEndReachedThreshold={0.5}
				onEndReached={handleEndReached}
				ListFooterComponent={
					isLoading ? (
						<View className="py-3 items-center justify-center">
							<ActivityIndicator
								size="small"
								color={APP_COLOR.PRIMARY}
								animating={true}
							/>
						</View>
					) : null
				}
			/>
		</SafeAreaView>
	);
}
