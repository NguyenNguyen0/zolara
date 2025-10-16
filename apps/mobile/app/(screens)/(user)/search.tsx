import { View, Text, FlatList, ListRenderItem } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ContactItem from '@/src/components/item/contact.item';
import Header from '@/src/components/commons/header';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';

// get in contact tab object
const CONTACTS = [
	{
		avatar: '',
		name: 'Larson Ashbee',
		email: 'nvminh162@gmail.com',
		verified: true,
	},
	{
		avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80',
		name: 'Rosie Arterton',
		email: 'nvminh162@gmail.com',
		verified: true,
	},
	{
		avatar: '',
		name: 'Lorraine Abbott',
		email: 'nvminh162@gmail.com',
		verified: false,
	},
	{
		avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
		name: 'Knapp Berry',
		email: 'nvminh162@gmail.com',
		verified: true,
	},
	{
		avatar: '',
		name: 'Bell Burgess',
		email: 'nvminh162@gmail.com',
		verified: false,
	},
	{
		avatar: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
		name: 'Shelby Ballard',
		email: 'nvminh162@gmail.com',
		verified: true,
	},
	{
		avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80',
		name: 'Bernard Baker',
		email: 'nvminh162@gmail.com',
		verified: false,
	},
	{
		avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80',
		name: 'Elma Chapman',
		email: 'nvminh162@gmail.com',
		verified: true,
	},
];

type Contact = {
	avatar: string;
	name: string;
	email: string;
	verified?: boolean;
};

export default function Search() {
	const { t } = useTranslation('contact');
	const { isDark } = useTheme();
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredContacts, setFilteredContacts] = useState<Contact[]>(CONTACTS);

	const handleContactPress = (contact: Contact) => {
		console.log('Contact pressed:', contact);
	};

	const handleSearch = (searchValue: string) => {
		console.log('Searching for:', searchValue);
		setSearchQuery(searchValue);
		
		if (!searchValue.trim()) {
			// Nếu search rỗng, hiển thị tất cả
			setFilteredContacts(CONTACTS);
			return;
		}

		// Filter theo tên hoặc email
		const filtered = CONTACTS.filter((contact) => {
			const nameMatch = contact.name.toLowerCase().includes(searchValue.toLowerCase());
			const emailMatch = contact.email.toLowerCase().includes(searchValue.toLowerCase());
			return nameMatch || emailMatch;
		});

		setFilteredContacts(filtered);
	};

	// Render contact item
	const renderContact: ListRenderItem<Contact> = ({ item }) => (
		<ContactItem
			img={item.avatar}
			name={item.name}
			email={item.email}
			verified={item.verified}
			onPress={() => handleContactPress(item)}
		/>
	);

	// Render empty state
	const renderEmptyState = () => (
		<View className="flex-1 items-center justify-center py-20">
			<Text className="text-lg text-gray-500 dark:text-gray-400">
				{searchQuery ? 'Không tìm thấy kết quả' : 'Không có liên hệ'}
			</Text>
		</View>
	);

	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<Header
				showBackButton
				showSearchInput
				showQRScanner
				onSearchChange={handleSearch}
			/>
			<FlatList
				data={filteredContacts}
				keyExtractor={(item, index) => `${item.email}-${index}`}
				renderItem={renderContact}
				ListEmptyComponent={renderEmptyState}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 24 }}
			/>
		</SafeAreaView>
	);
}
