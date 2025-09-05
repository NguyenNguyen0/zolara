import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import AntDesign from '@expo/vector-icons/AntDesign';

interface LanguageSelectorProps {
	onLanguagePress?: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
	onLanguagePress,
}) => {
	const { t, i18n } = useTranslation('common');

	const changeLanguage = () => {
		const currentLang = i18n.language;
		const newLang = currentLang === 'en' ? 'vi' : 'en';

		i18n.changeLanguage(newLang);
		Alert.alert(
			t('selectLanguage'),
			`${t('language')}: ${newLang === 'en' ? 'English' : 'Tiếng Việt'}`,
		);
	};

	const displayLanguage = i18n.language === 'en' ? 'English' : 'Tiếng Việt';

	return (
		<TouchableOpacity onPress={changeLanguage} activeOpacity={0.7}>
			<View className="bg-gray-100 rounded-full px-4 py-2 flex-row items-center">
				<Text className="text-black font-medium text-sm">
					{displayLanguage}
				</Text>
				<AntDesign
					className="text-gray-400 ml-2 text-xs"
					name="down"
					size={12}
					color="black"
				/>
			</View>
		</TouchableOpacity>
	);
};

export default LanguageSelector;
