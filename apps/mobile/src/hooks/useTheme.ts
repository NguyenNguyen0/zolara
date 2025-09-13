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

	// Sync device color scheme with store
	useEffect(() => {
		if (deviceColorScheme !== systemTheme) {
			dispatch(setSystemTheme(deviceColorScheme || 'light'));
		}
	}, [deviceColorScheme, systemTheme, dispatch]);

	// Sync NativeWind color scheme with theme state
	useEffect(() => {
		setColorScheme(isDark ? 'dark' : 'light');
	}, [isDark, setColorScheme]);

	// Load theme from storage on mount (chỉ chạy một lần)
	useEffect(() => {
		let isMounted = true;

		const loadTheme = async () => {
			try {
				const savedTheme = await AsyncStorage.getItem('app-theme');
				const currentSystemTheme = deviceColorScheme || 'light';
				
				const themeToLoad =
					savedTheme && ['light', 'dark', 'system'].includes(savedTheme)
						? (savedTheme as Theme)
						: 'system';

				if (isMounted) {
					dispatch(initializeTheme({
						theme: themeToLoad,
						systemTheme: currentSystemTheme,
					}));
				}
			} catch (error) {
				console.log('Error loading theme:', error);
			}
		};

		// Chỉ load nếu chưa khởi tạo (tránh load lại liên tục)
		if (theme === 'system' && systemTheme === 'light' && deviceColorScheme) {
			loadTheme();
		}

		return () => {
			isMounted = false;
		};
	}, []); // Empty dependency array - chỉ chạy một lần

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
