import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useMemo, useState } from 'react';
import FeatherIcon from '@expo/vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import ContactItem from '@/src/components/item/contact.item';
import Header from '@/src/components/commons/header';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';

const CONTACTS = [
	{
		avatar: '',
		name: 'Larson Ashbee',
		email: 'nvminh162@gmail.com',
	},
	{
		avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80',
		name: 'Rosie Arterton',
		email: 'nvminh162@gmail.com',
	},
	{
		avatar: '',
		name: 'Lorraine Abbott',
		email: 'nvminh162@gmail.com',
	},
	{
		avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
		name: 'Knapp Berry',
		email: 'nvminh162@gmail.com',
	},
	{
		avatar: '',
		name: 'Bell Burgess',
		email: 'nvminh162@gmail.com',
	},
	{
		avatar: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
		name: 'Shelby Ballard',
		email: 'nvminh162@gmail.com',
	},
	{
		avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80',
		name: 'Bernard Baker',
		email: 'nvminh162@gmail.com',
	},
	{
		avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80',
		name: 'Elma Chapman',
		email: 'nvminh162@gmail.com',
	},
];

export default function Contact() {
	const { t } = useTranslation('contact');
	const { isDark } = useTheme();
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		// Simulate API call
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	const sections = useMemo(() => {
		const sectionsMap = CONTACTS.reduce(
			(acc: Record<string, typeof CONTACTS>, item) => {
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

	const handleContactPress = (contact: (typeof CONTACTS)[0]) => {
		console.log('Contact pressed:', contact);
	};

	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<Header title={t('header')} showSearch showAddPerson />
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 24 }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={isDark ? '#fff' : '#000'}
					/>
				}
			>
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

				{sections.map(({ letter, items }) => (
					<View key={letter} className="mt-3 pl-6">
						<Text className="text-xl font-bold text-dark-mode dark:text-light-mode">
							{letter}
						</Text>
						<View className="mt-2">
							{(items as typeof CONTACTS).map(
								(contact, index) => (
									<ContactItem
										key={index}
										img={contact.avatar}
										name={contact.name}
										email={contact.email}
										onPress={() =>
											handleContactPress(contact)
										}
									/>
								),
							)}
						</View>
					</View>
				))}
			</ScrollView>
		</SafeAreaView>
	);
}
