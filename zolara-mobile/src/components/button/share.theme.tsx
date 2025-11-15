import SharePicker, { PickerItem } from '@/src/components/input/share.picker';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

type ThemeMode = 'light' | 'dark';

const ShareTheme: React.FC = () => {
	const { theme, setTheme, isDark } = useTheme();
	const { t } = useTranslation('theme');
	const [open, setOpen] = useState(false);
	const [selectedTheme, setSelectedTheme] = useState<string | null>(theme);
	const isInitialMount = useRef(true);

	const themeItems: PickerItem[] = useMemo(() => [
		{ 
			label: t('light'), 
			value: 'light',
			icon: <Feather name="sun" size={24} color={isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE} />
		},
		{ 
			label: t('dark'), 
			value: 'dark',
			icon: <Feather name="moon" size={24} color={isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE} />
		},
	], [t, isDark]);

	const [items, setItems] = useState(themeItems);

	// Update items khi language thay đổi
	useEffect(() => {
		setItems(themeItems);
	}, [themeItems]);

	// Chỉ sync khi selectedTheme thay đổi từ user action
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}
		
		if (selectedTheme && (selectedTheme === 'light' || selectedTheme === 'dark') && selectedTheme !== theme) {
			setTheme(selectedTheme as ThemeMode);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTheme]);

	const renderIcon = (themeValue: string, isDark: boolean) => {
		const color = isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE;
		switch (themeValue) {
			case 'light':
				return <Feather name="sun" size={20} color={color} />;
			case 'dark':
				return <Feather name="moon" size={20} color={color} />;
			default:
				return <Feather name="sun" size={20} color={color} />;
		}
	};

	return (
		<SharePicker
			open={open}
			value={selectedTheme}
			items={items}
			setOpen={setOpen}
			setValue={setSelectedTheme}
			setItems={setItems}
			placeholder={t('selectTheme')}
			renderTrigger={(selectedItem, isDark, open) => (
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
					{selectedItem && renderIcon(selectedItem.value, isDark)}
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

export default ShareTheme;
