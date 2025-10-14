import { APP_COLOR } from '@/src/utils/constants';
import React, { useEffect, useMemo, useState } from 'react';
import { View, StatusBar, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import ShareInput from '@/src/components/input/share.input';
import { useTheme } from '@/src/hooks/useTheme';
import debounce from 'debounce';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface HeaderProps {
	showSearch?: boolean;
	showBack?: boolean;
	showSearchInput?: boolean;
	showQRScanner?: boolean;
	showAdd?: boolean;
	showAddPerson?: boolean;
	showAddPost?: boolean;
	showSettings?: boolean;
}

export default function Header({
	showSearch = false,
	showBack = false,
	showSearchInput = true,
	showQRScanner = false,
	showAdd = false,
	showAddPerson = false,
	showAddPost = false,
	showSettings = false,
}: HeaderProps) {
	const [search, setSearch] = useState<string>('');
	const { t } = useTranslation('header');
	const { isDark } = useTheme();

	const debouncedSearch = useMemo(
		() =>
			debounce((text: string) => {
				if (!text) return;
				console.log('fake log search:', text);
			}, 1000),
		[],
	);

	useEffect(() => {
		return () => {
			debouncedSearch.clear();
		};
	}, [debouncedSearch]);

	const hasLeftIcons = showSearch || showBack;
	const hasRightIcons =
		showQRScanner ||
		showAdd ||
		showAddPerson ||
		showAddPost ||
		showSettings;

	return (
		<>
			<StatusBar
				barStyle='light-content'
				backgroundColor={`${isDark ? APP_COLOR.DARK_MODE : APP_COLOR.PRIMARY}`}
			/>
			<View
				className={`${isDark ? 'bg-dark-mode' : 'bg-primary'}`}
				style={{
					borderBottomColor: isDark
						? APP_COLOR.GRAY_700
						: APP_COLOR.GRAY_200,
					borderBottomWidth: 1,
				}}
			>
				<View className="mx-3 my-4">
					<View className="flex-row items-center justify-between gap-2">
						{hasLeftIcons && (
							<View className="flex-row">
								{showSearch && (
									<TouchableOpacity
										onPress={() =>
											console.log('Click here')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="search"
											size={24}
											color="white"
										/>
									</TouchableOpacity>
								)}
								{showBack && (
									<TouchableOpacity
										onPress={() =>
											console.log('Click here')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="chevron-left"
											size={24}
											color="white"
										/>
									</TouchableOpacity>
								)}
							</View>
						)}

						{showSearchInput && (
							<View className="flex-1">
								<ShareInput
									value={search}
									onTextChange={(text) => {
										setSearch(text);
										debouncedSearch(text);
									}}
									placeholder={t('search')}
									inputStyle={{
										borderRadius: 10,
										backgroundColor: 'transparent',
										borderWidth: 0,
										paddingVertical: 10,
										color: "white"
									}}
									clear
									placeholderTextColor='white'
								/>
							</View>
						)}

						{hasRightIcons && (
							<View className="flex-row">
								{showQRScanner && (
									<TouchableOpacity
										onPress={() =>
											console.log('Click here')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="qr-code-scanner"
											size={24}
											color="white"
										/>
									</TouchableOpacity>
								)}
								{showAdd && (
									<TouchableOpacity
										onPress={() =>
											console.log('Click here')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="add"
											size={24}
											color="white"
										/>
									</TouchableOpacity>
								)}
								{showAddPerson && (
									<TouchableOpacity
										onPress={() =>
											console.log('Click here')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="person-add-alt-1"
											size={24}
											color="white"
										/>
									</TouchableOpacity>
								)}
								{showAddPost && (
									<TouchableOpacity
										onPress={() =>
											console.log('Click here')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="post-add"
											size={24}
											color="white"
										/>
									</TouchableOpacity>
								)}
								{showSettings && (
									<TouchableOpacity
										onPress={() =>
											console.log('Click here')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="settings"
											size={24}
											color="white"
										/>
									</TouchableOpacity>
								)}
							</View>
						)}
					</View>
				</View>
			</View>
		</>
	);
}
