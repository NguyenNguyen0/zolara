import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState, AppDispatch } from '@/src/store';
import {
	setTheme as setThemeAction,
	setSystemTheme,
	initializeTheme,
	selectIsDark,
	Theme,
} from '@/src/store/slices/themeSlice';

export const useTheme = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { theme, systemTheme } = useSelector(
		(state: RootState) => state.theme,
	);
	const isDark = useSelector((state: RootState) => selectIsDark(state));
	const deviceColorScheme = useColorScheme();
	const { setColorScheme } = useNativeWindColorScheme();

	// Load theme from storage on mount (chỉ chạy một lần)
	useEffect(() => {
		let isMounted = true;

		const loadTheme = async () => {
			try {
				const savedTheme = await AsyncStorage.getItem('app-theme');
				const currentSystemTheme = deviceColorScheme || 'light';

				const themeToLoad =
					savedTheme &&
					['light', 'dark', 'system'].includes(savedTheme)
						? (savedTheme as Theme)
						: 'system';

				if (isMounted) {
					dispatch(
						initializeTheme({
							theme: themeToLoad,
							systemTheme: currentSystemTheme,
						}),
					);
				}
			} catch (error) {
				console.log('Error loading theme:', error);
			}
		};

		loadTheme();

		return () => {
			isMounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Sync device color scheme with store (sau khi đã load theme)
	useEffect(() => {
		if (deviceColorScheme && deviceColorScheme !== systemTheme) {
			dispatch(setSystemTheme(deviceColorScheme));
		}
	}, [deviceColorScheme, systemTheme, dispatch]);

	// Sync NativeWind color scheme with theme state
	useEffect(() => {
		setColorScheme(isDark ? 'dark' : 'light');
	}, [isDark, setColorScheme]);

	const setTheme = async (newTheme: Theme) => {
		try {
			await AsyncStorage.setItem('app-theme', newTheme);
			dispatch(setThemeAction(newTheme));
		} catch (error) {
			console.log('Error saving theme:', error);
		}
	};

	return {
		theme,
		isDark,
		setTheme,
	};
};
