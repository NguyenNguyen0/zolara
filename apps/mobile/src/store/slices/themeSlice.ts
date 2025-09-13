import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark' | 'system';

interface ITheme {
	theme: Theme;
	systemTheme: 'light' | 'dark';
}

// Helper function để tính isDark
const getIsDark = (theme: Theme, systemTheme: 'light' | 'dark'): boolean => {
	return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
};

const initialState: ITheme = {
	theme: 'system',
	systemTheme: 'light',
};

const themeSlice = createSlice({
	name: 'theme',
	initialState,
	reducers: {
		setTheme: (state, action: PayloadAction<Theme>) => {
			state.theme = action.payload;
		},
		setSystemTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
			state.systemTheme = action.payload;
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
		},
	},
});

export const { setTheme, setSystemTheme, initializeTheme } = themeSlice.actions;

// Selector để tính isDark
export const selectIsDark = (state: { theme: ITheme }) => 
	getIsDark(state.theme.theme, state.theme.systemTheme);

export default themeSlice.reducer;
