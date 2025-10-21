import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, ListRenderItem } from 'react-native';
import React, { useMemo, useState } from 'react';
import FeatherIcon from '@expo/vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import ContactItem from '@/src/components/item/contact.item';
import NavigateHeader from '@/src/components/commons/navigate.header';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import { MOCK_CONTACTS, Contact } from '@/src/mocks/contact';

type Section = {
	letter: string;
	items: Contact[];
};

export default function ContactTab() {
	const { t } = useTranslation('contact');
	const { isDark } = useTheme();
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
			// Simulate API call to load more contacts
			setTimeout(() => {
				setIsLoadingMore(false);
			}, 2000);
		}
	};

	const sections = useMemo(() => {
		const sectionsMap = MOCK_CONTACTS.reduce(
			(acc: Record<string, Contact[]>, item) => {
				const [lastName] = item.name.split(' ').reverse();
				return Object.assign(acc, {
					[lastName[0]]: [...(acc[lastName[0]] || []), item],
				});
			},
			{},
		);
		return Object.entries(sectionsMap)
			.map(([letter, items]) => ({
				letter,
				items,
			}))
			.sort((a, b) => a.letter.localeCompare(b.letter));
	}, []);

	const handleContactPress = (contact: Contact) => {
		console.log('Contact pressed:', contact);
	};

	// Render header with friend requests and birthdays
	const renderListHeader = () => (
		<View className="bg-light-mode dark:bg-dark-mode">
			<View className="px-6">
				<TouchableOpacity activeOpacity={0.8} className="border-b border-gray-200 dark:border-gray-700">
					<View className="py-3.5 flex-row items-center">
						<View className="w-10 h-10 rounded-xl bg-blue-500 items-center justify-center">
							<FeatherIcon name="users" size={18} color="#ffffff" />
						</View>
						<Text className="ml-3 text-base font-semibold text-dark-mode dark:text-light-mode flex-1">Friend requests (99+)</Text>
						<FeatherIcon name="chevron-right" size={20} color="#9ca3af" />
					</View>
				</TouchableOpacity>

				<TouchableOpacity activeOpacity={0.8}>
					<View className="py-3.5 flex-row items-center">
						<View className="w-10 h-10 rounded-xl bg-blue-500 items-center justify-center">
							<FeatherIcon name="gift" size={18} color="#ffffff" />
						</View>
						<Text className="ml-3 text-base font-semibold text-dark-mode dark:text-light-mode flex-1">Birthdays</Text>
						<FeatherIcon name="chevron-right" size={20} color="#9ca3af" />
					</View>
				</TouchableOpacity>
			</View>
		</View>
	);

	// Render section (letter + contacts)
	const renderSection: ListRenderItem<Section> = ({ item }) => (
		<View className="mt-3 pl-6">
			<Text className="text-xl font-bold text-dark-mode dark:text-light-mode">
				{item.letter}
			</Text>
			<View className="mt-2">
				{item.items.map((contact, index) => (
					<ContactItem
						key={`${item.letter}-${index}`}
						img={contact.avatar}
						name={contact.name}
						email={contact.email}
						verified={contact.verified}
						onPress={() => handleContactPress(contact)}
					/>
				))}
			</View>
		</View>
	);

	// Render loading footer
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
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader title={t('header')} showSearch showAddFriend />
			<FlatList
				data={sections}
				keyExtractor={(item) => item.letter}
				renderItem={renderSection}
				ListHeaderComponent={renderListHeader}
				ListFooterComponent={renderFooter}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.5}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={isDark ? '#fff' : '#000'}
					/>
				}
				showsVerticalScrollIndicator={false}
			/>
		</SafeAreaView>
	);
}
