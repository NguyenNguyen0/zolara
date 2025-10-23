import { APP_COLOR } from '@/src/utils/constants';
import React, { useState, useEffect, useCallback } from 'react';
import { View, StatusBar, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import ShareInput from '@/src/components/input/share.input';
import debounce from 'debounce';

interface HeaderProps {
	title?: string;
	showBackButton?: boolean;
	showSearchInput?: boolean;
	showSearch?: boolean;
	showQRScanner?: boolean;
	showCreateGroup?: boolean;
	showAddFriend?: boolean;
	showAddPost?: boolean;
	showSettings?: boolean;
	showMenu?: boolean;
	showSubmit?: boolean;
	onSearchChange?: (value: string) => void;
	onSubmit?: () => void;
}

export default function NavigateHeader({
	title = "",
	showBackButton = false,
	showSearchInput = false,
	showSearch = false,
	showQRScanner = false,
	showCreateGroup = false,
	showAddFriend = false,
	showSettings = false,
	showMenu = false,
	showSubmit = false,
	onSearchChange,
	onSubmit,
}: HeaderProps) {
	const { isDark } = useTheme();
	const router = useRouter();
	const [searchValue, setSearchValue] = useState<string>('');
	const [debouncedSearchValue, setDebouncedSearchValue] = useState<string>('');

	// Tạo debounced function với delay 3 giây
	const debouncedSearch = useCallback(
		debounce((value: string) => {
			setDebouncedSearchValue(value);
			if (onSearchChange) {
				onSearchChange(value);
			}
		}, 1500),
		[onSearchChange]
	);

	// Cleanup debounce khi component unmount
	useEffect(() => {
		return () => {
			debouncedSearch.clear();
		};
	}, [debouncedSearch]);

	// Xử lý khi input thay đổi
	const handleSearchChange = (value: string) => {
		setSearchValue(value);
		debouncedSearch(value);
	};

	const hasLeftIcons = showBackButton;

	const hasRightIcons =
		showSearch ||
		showQRScanner ||
		showCreateGroup ||
		showAddFriend ||
		showSettings ||
		showMenu ||
		showSubmit;

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
				<View className="m-4">
					<View className="flex-row items-center justify-between gap-2">
						{/* Icons - Left Side */}
						{hasLeftIcons && (
							<View className="flex-row gap-1">
								{showBackButton && (
									<TouchableOpacity
										onPress={() => router.back()}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="arrow-back-ios-new"
											size={26}
											color="white"
										/>
									</TouchableOpacity>
								)}
							</View>
						)}

						{/* Title or Search Input - Center */}
						{showSearchInput ? (
							<View className="flex-1 mx-4">
								<ShareInput
									value={searchValue}
									onTextChange={handleSearchChange}
									placeholder="Tìm kiếm..."
									inputStyle={{
										backgroundColor: isDark ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE,
										borderColor: 'transparent',
										paddingVertical: 10
									}}
									placeholderTextColor={isDark ? APP_COLOR.GRAY_700 : APP_COLOR.GRAY_700}
									clear
									autoFocus
								/>
							</View>
						) : (
							<Text className="text-white text-2xl font-bold flex-1">
								{title}
							</Text>
						)}

						{/* Icons - Right Side */}
						{hasRightIcons && (
							<View className="flex-row gap-1">
								{showSearch && (
									<TouchableOpacity
										onPress={() =>
											router.navigate('/(screens)/(user)/search')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="search"
											size={26}
											color="white"
										/>
									</TouchableOpacity>
								)}
								{showQRScanner && (
									<TouchableOpacity
										onPress={() =>
											router.navigate('/(screens)/(user)/qr')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="qr-code-scanner"
											size={26}
											color="white"
										/>
									</TouchableOpacity>
								)}
							{showCreateGroup && (
								<TouchableOpacity
									onPress={() =>
										router.navigate('/(screens)/(user)/group.create')
									}
									className="w-10 h-10 rounded-full items-center justify-center"
								>
									<MaterialIcons
										name="groups"
										size={26}
										color="white"
									/>
								</TouchableOpacity>
							)}
								{showAddFriend && (
									<TouchableOpacity
										onPress={() =>
											router.navigate('/(screens)/(user)/add.friend')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="person-add-alt-1"
											size={26}
											color="white"
										/>
									</TouchableOpacity>
								)}
								{showSettings && (
									<TouchableOpacity
										onPress={() =>
											router.navigate('/(screens)/(user)/setting')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="settings"
											size={26}
											color="white"
										/>
									</TouchableOpacity>
								)}
							{showMenu && (
								<TouchableOpacity
									onPress={() =>
										console.log('Menu clicked: update later')
									}
									className="w-10 h-10 rounded-full items-center justify-center"
								>
									<MaterialIcons
										name="more-vert"
										size={26}
										color="white"
									/>
								</TouchableOpacity>
							)}
							{showSubmit && (
								<TouchableOpacity
									onPress={onSubmit}
									className="w-10 h-10 rounded-full items-center justify-center"
								>
									<MaterialIcons
										name="check"
										size={26}
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
