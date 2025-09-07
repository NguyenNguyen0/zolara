import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

interface ITheme {
	theme: Theme;
	isDark: boolean;
	systemTheme: 'light' | 'dark';
}

const initialState: ITheme = {
	theme: 'system',
	isDark: false,
	systemTheme: 'light', // Initialize with a default value instead of null
};

const themeSlice = createSlice({
	name: 'theme',
	initialState,
	reducers: {
		setTheme: (state, action: PayloadAction<Theme>) => {
			state.theme = action.payload;
			// Update isDark based on theme and system preference
			state.isDark =
				action.payload === 'dark' ||
				(action.payload === 'system' && state.systemTheme === 'dark');
		},
		setSystemTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
			state.systemTheme = action.payload;
			// Update isDark if current theme is 'system'
			if (state.theme === 'system') {
				state.isDark = action.payload === 'dark';
			}
		},
		initializeTheme: (
			state,
			action: PayloadAction<{
				theme: Theme;
				systemTheme: 'light' | 'dark';
			}>,
		) => {
			state.theme = action.payload.theme;
			state.systemTheme = action.payload.systemTheme;
			state.isDark =
				action.payload.theme === 'dark' ||
				(action.payload.theme === 'system' &&
					action.payload.systemTheme === 'dark');
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loadThemeFromStorage.fulfilled, (state, action) => {
				state.theme = action.payload.theme;
				state.systemTheme = action.payload.systemTheme;
				state.isDark =
					action.payload.theme === 'dark' ||
					(action.payload.theme === 'system' &&
						action.payload.systemTheme === 'dark');
			})
			.addCase(saveThemeToStorage.fulfilled, (state, action) => {
				state.theme = action.payload;
				state.isDark =
					action.payload === 'dark' ||
					(action.payload === 'system' &&
						state.systemTheme === 'dark');
			});
	},
});

export const { setTheme, setSystemTheme, initializeTheme } = themeSlice.actions;

// Async thunk for loading theme from storage
export const loadThemeFromStorage = createAsyncThunk(
	'theme/loadThemeFromStorage',
	async (
		_,
		{ dispatch },
	): Promise<{ theme: Theme; systemTheme: 'light' | 'dark' }> => {
		try {
			const savedTheme = await AsyncStorage.getItem('app-theme');
			// Get system theme from Appearance API instead of useColorScheme hook
			const systemTheme = (Appearance.getColorScheme() || 'light') as
				| 'light'
				| 'dark';

			const theme =
				savedTheme && ['light', 'dark', 'system'].includes(savedTheme)
					? (savedTheme as Theme)
					: 'system';

			return { theme, systemTheme };
		} catch (error) {
			console.log('Error loading theme:', error);
			const systemTheme = (Appearance.getColorScheme() || 'light') as
				| 'light'
				| 'dark';
			return { theme: 'system' as Theme, systemTheme };
		}
	},
);

// Async thunk for saving theme to storage
export const saveThemeToStorage = createAsyncThunk(
	'theme/saveThemeToStorage',
	async (theme: Theme, { dispatch }) => {
		try {
			await AsyncStorage.setItem('app-theme', theme);
			return theme;
		} catch (error) {
			console.log('Error saving theme:', error);
			throw error;
		}
	},
);

export default themeSlice.reducer;
