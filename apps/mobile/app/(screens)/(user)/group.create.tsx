import NavigateHeader from '@/src/components/commons/navigate.header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, ScrollView } from 'react-native';
import { useState } from 'react';
import { MOCK_CONTACTS, Contact } from '@/src/mocks/contact';
import ContactItem from '@/src/components/item/contact.item';
import ShareAvatar from '@/src/components/input/share.avatar';
import ShareInput from '@/src/components/input/share.input';
import Avatar from '@/src/components/ui/avatar';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import { useTranslation } from 'react-i18next';

export default function GroupCreate() {
	const { isDark } = useTheme();
	const { t } = useTranslation('group-create');
	const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
	const [groupName, setGroupName] = useState('');
	const [groupAvatar, setGroupAvatar] = useState<string | null>(null);

	const handleToggleContact = (contact: Contact) => {
		const isSelected = selectedContacts.some((c) => c.id === contact.id);
		if (isSelected) {
			setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
		} else {
			setSelectedContacts([...selectedContacts, contact]);
		}
	};

	const handleRemoveContact = (contact: Contact) => {
		setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
	};

	const handleCreateGroup = () => {
		console.log('=== CREATE GROUP ===');
		console.log('Group Name:', groupName);
		console.log('Group Avatar:', groupAvatar);
		console.log('Selected Members:', selectedContacts.length);
		console.log('Members:', selectedContacts.map(c => ({
			id: c.id,
			name: c.name,
			email: c.email,
		})));
	};

	return (
		<SafeAreaView
			edges={['top', 'bottom']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader
				showBackButton
				title={t('title')}
				showSubmit={selectedContacts.length >= 3}
				onSubmit={handleCreateGroup}
				showQRScanner
			/>

			<View className="flex-1">
				{/* Group Info Section */}
				<View className="py-4 px-4 border-b border-gray-200 dark:border-gray-700">
					<View className="flex-row items-center gap-3">
						{/* Group Avatar */}
						<ShareAvatar
							imageUri={groupAvatar}
							onImageChange={setGroupAvatar}
							showCameraButton={true}
							size={80}
						/>

						{/* Group Name Input */}
						<View className="flex-1">
							<ShareInput
								value={groupName}
								onTextChange={setGroupName}
								placeholder={t('groupNamePlaceholder')}
								inputStyle={{
									backgroundColor: isDark ? APP_COLOR.GRAY_800 : APP_COLOR.GRAY_100,
									borderColor: isDark ? APP_COLOR.GRAY_700 : APP_COLOR.GRAY_300,
								}}
								placeholderTextColor={isDark ? APP_COLOR.GRAY_500 : APP_COLOR.GRAY_400}
							/>
						</View>
					</View>
				</View>

				{/* Contact Selection List */}
				<View className="flex-1">
					<FlatList
						data={MOCK_CONTACTS}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<ContactItem
								img={item.avatar}
								name={item.name}
								email={item.email}
								verified={item.verified}
								showRadio={true}
								isSelected={selectedContacts.some((c) => c.id === item.id)}
								onPress={() => handleToggleContact(item)}
							/>
						)}
						contentContainerStyle={{ paddingHorizontal: 16 }}
					/>
				</View>

				{/* Selected Contacts Preview */}
				{selectedContacts.length > 0 && (
					<View className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
						<Text className={`text-sm font-medium mb-3 ${isDark ? 'text-light-mode' : 'text-gray-600'}`}>
							{t('selected', { count: selectedContacts.length })}
						</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							<View className="flex-row gap-3">
								{selectedContacts.map((contact) => (
									<View key={contact.id} className="items-center">
										<Avatar
											uri={contact.avatar}
											onPress={() => handleRemoveContact(contact)}
										/>
										<Text
											className={`text-xs mt-1 ${isDark ? 'text-light-mode' : 'text-gray-600'}`}
											numberOfLines={1}
											style={{ maxWidth: 40 }}
										>
											{contact.name.split(' ')[0]}
										</Text>
									</View>
								))}
							</View>
						</ScrollView>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
}
