import { useThemeStore } from '@/src/store/themeStore';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useEffect, useRef } from 'react';

export const useTheme = () => {
	const { setColorScheme } = useNativeWindColorScheme();
	const isInitializedRef = useRef(false);

	const { theme, isInitialized, isDark, setTheme, initialize } = useThemeStore();

	// Initialize theme on mount (once)
	useEffect(() => {
		if (!isInitializedRef.current) {
			initialize();
			isInitializedRef.current = true;
		}
	}, [initialize]);

	// Sync NativeWind color scheme with theme state
	useEffect(() => {
		if (isInitialized) {
			setColorScheme(isDark ? 'dark' : 'light');
		}
	}, [isDark, isInitialized, setColorScheme]);

	return {
		theme,
		isDark,
		setTheme,
	};
};
