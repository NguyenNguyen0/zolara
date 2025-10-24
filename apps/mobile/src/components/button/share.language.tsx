import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Image, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLOR } from '@/src/utils/constants';
import SharePicker, { PickerItem } from '@/src/components/input/share.picker';

const ShareLanguage: React.FC = () => {
	const { i18n, t } = useTranslation('language');
	const [open, setOpen] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState<string | null>(i18n.language);
	const isInitialMount = useRef(true);

	const languageItems: PickerItem[] = useMemo(() => [
		{ 
			label: t('en'), 
			value: 'en',
			icon: (
				<Image 
					source={require('@/src/assets/images/language/eng.png')} 
					style={{ width: 32, height: 32, borderRadius: 16 }}
					resizeMode="cover"
				/>
			)
		},
		{ 
			label: t('vi'), 
			value: 'vi',
			icon: (
				<Image 
					source={require('@/src/assets/images/language/vi.png')} 
					style={{ width: 32, height: 32, borderRadius: 16 }}
					resizeMode="cover"
				/>
			)
		},
	], [t]);

	const [items, setItems] = useState(languageItems);

	// Update items khi language thay đổi
	useEffect(() => {
		setItems(languageItems);
	}, [languageItems]);

	// Chỉ sync khi selectedLanguage thay đổi từ user action
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}
		
		if (selectedLanguage && selectedLanguage !== i18n.language) {
			i18n.changeLanguage(selectedLanguage);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedLanguage]);

	return (
		<SharePicker
			open={open}
			value={selectedLanguage}
			items={items}
			setOpen={setOpen}
			setValue={setSelectedLanguage}
			setItems={setItems}
			placeholder={t('selectLanguage')}
			renderTrigger={(selectedItem, isDark) => (
				<View
					style={{
						backgroundColor: isDark ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE,
						borderColor: isDark ? APP_COLOR.GRAY_700 : APP_COLOR.GRAY_200,
						borderWidth: 2,
						borderRadius: 8,
						paddingHorizontal: 12,
						paddingVertical: 10,
						flexDirection: 'row',
						alignItems: 'center',
						gap: 6,
					}}
				>
					{selectedItem && (
						<Image 
							source={selectedItem.value === 'en' 
								? require('@/src/assets/images/language/eng.png') 
								: require('@/src/assets/images/language/vi.png')
							} 
							style={{ width: 20, height: 20, borderRadius: 10 }}
							resizeMode="cover"
						/>
					)}
					<Text className='text-dark-mode dark:text-light-mode'>{selectedItem?.label}</Text>
					<Ionicons
						name="chevron-down"
						size={14}
						color={isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE}
					/>
				</View>
			)}
		/>
	);
};

export default ShareLanguage;
