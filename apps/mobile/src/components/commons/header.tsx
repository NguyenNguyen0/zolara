import { APP_COLOR } from '@/src/utils/constants';
import React from 'react';
import { View, StatusBar, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface HeaderProps {
	title: string;
	showSearch?: boolean;
	showQRScanner?: boolean;
	showAdd?: boolean;
	showAddPerson?: boolean;
	showAddPost?: boolean;
	showSettings?: boolean;
	showMenu?: boolean;
}

export default function Header({
	title,
	showSearch = false,
	showQRScanner = false,
	showAdd = false,
	showAddPerson = false,
	showAddPost = false,
	showSettings = false,
	showMenu = false,
}: HeaderProps) {
	const { isDark } = useTheme();

	const hasRightIcons =
		showSearch ||
		showQRScanner ||
		showAdd ||
		showAddPerson ||
		showAddPost ||
		showSettings ||
		showMenu;

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
					<View className="flex-row items-center justify-between">
						{/* Title - Left Side */}
						<Text className="text-white text-2xl font-bold flex-1">
							{title}
						</Text>

						{/* Icons - Right Side */}
						{hasRightIcons && (
							<View className="flex-row gap-1">
								{showSearch && (
									<TouchableOpacity
										onPress={() =>
											console.log('Search clicked')
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
											console.log('QR Scanner clicked')
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
								{showAdd && (
									<TouchableOpacity
										onPress={() =>
											console.log('Add clicked')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="add"
											size={26}
											color="white"
										/>
									</TouchableOpacity>
								)}
								{showAddPerson && (
									<TouchableOpacity
										onPress={() =>
											console.log('Add person clicked')
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
								{showAddPost && (
									<TouchableOpacity
										onPress={() =>
											console.log('Add post clicked')
										}
										className="w-10 h-10 rounded-full items-center justify-center"
									>
										<MaterialIcons
											name="post-add"
											size={26}
											color="white"
										/>
									</TouchableOpacity>
								)}
								{showSettings && (
									<TouchableOpacity
										onPress={() =>
											console.log('Settings clicked')
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
											console.log('Menu clicked')
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
							</View>
						)}
					</View>
				</View>
			</View>
		</>
	);
}
