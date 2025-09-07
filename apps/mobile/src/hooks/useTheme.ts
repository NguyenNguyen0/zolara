import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/src/store';
import { setSystemTheme, loadThemeFromStorage, saveThemeToStorage } from '@/src/store/slices/themeSlice';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme, isDark, systemTheme } = useSelector((state: RootState) => state.theme);
  const deviceColorScheme = useColorScheme();

  // Update system theme when device color scheme changes
  useEffect(() => {
    if (deviceColorScheme !== systemTheme) {
      dispatch(setSystemTheme(deviceColorScheme || 'light'));
    }
  }, [deviceColorScheme, systemTheme, dispatch]);

  // Load theme from storage on mount
  useEffect(() => {
    dispatch(loadThemeFromStorage());
  }, [dispatch]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch(saveThemeToStorage(newTheme));
  };

  return {
    theme,
    isDark,
    setTheme,
  };
};
