import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import Avatar from '../ui/avatar';

interface ContactItemProps {
	img?: string;
	name: string;
	email: string;
	verified?: boolean;
	onPress?: () => void;
	showRadio?: boolean;
	isSelected?: boolean;
}

export default function ContactItem({
	img,
	name,
	email,
	verified,
	onPress,
	showRadio = false,
	isSelected = false,
}: ContactItemProps) {
	const { isDark } = useTheme();

	return (
		<View className="border-b border-gray-200 dark:border-gray-700">
			<TouchableOpacity onPress={onPress} activeOpacity={0.7}>
				<View className="py-6 flex-row items-center justify-start">
					{showRadio && (
						<View className="mr-3">
							<View
								className="w-6 h-6 rounded-full border-2 items-center justify-center"
								style={{
									borderColor: isSelected ? APP_COLOR.PRIMARY : '#9ca3af',
									backgroundColor: isSelected ? APP_COLOR.PRIMARY : 'transparent',
								}}
							>
								{isSelected && (
									<Ionicons name="checkmark" size={16} color="white" />
								)}
							</View>
						</View>
					)}
					<Avatar uri={img} />
					<View className="flex-1 ml-3">
						<View className="flex-row items-center">
							<Text
								className={`text-base font-semibold text-gray-900 ${isDark ? 'text-light-mode' : 'text-dark-mode'}`}
								numberOfLines={1}
							>
								{name}
							</Text>
							{verified ? (
								<Ionicons name="checkmark-circle" size={16} color={APP_COLOR.PRIMARY} style={{ marginLeft: 4 }} />
							) : null}
						</View>
						<Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
							{email}
						</Text>
					</View>

					{!showRadio && (
						<View className="pr-4">
							<FeatherIcon
								name="chevron-right"
								size={20}
								color="#9ca3af"
							/>
						</View>
					)}
				</View>
			</TouchableOpacity>
		</View>
	);
}
