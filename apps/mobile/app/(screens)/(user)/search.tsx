import { View, Text, FlatList, ListRenderItem } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ContactItem from '@/src/components/item/contact.item';
import NavigateHeader from '@/src/components/commons/navigate.header';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import { MOCK_CONTACTS, Contact } from '@/src/mocks/contact';

export default function Search() {
	const { t } = useTranslation('contact');
	const { isDark } = useTheme();
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredContacts, setFilteredContacts] = useState<Contact[]>(MOCK_CONTACTS);

	const handleContactPress = (contact: Contact) => {
		console.log('Contact pressed:', contact);
	};

	const handleSearch = (searchValue: string) => {
		console.log('Searching for:', searchValue);
		setSearchQuery(searchValue);
		
		if (!searchValue.trim()) {
			// Nếu search rỗng, hiển thị tất cả
			setFilteredContacts(MOCK_CONTACTS);
			return;
		}

		// Filter theo tên hoặc email
		const filtered = MOCK_CONTACTS.filter((contact: Contact) => {
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
			<NavigateHeader
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
