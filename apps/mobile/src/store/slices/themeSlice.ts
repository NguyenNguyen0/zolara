import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  systemTheme: 'light' | 'dark' | null;
}

const initialState: ThemeState = {
  theme: 'system',
  isDark: false,
  systemTheme: null,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      // Update isDark based on theme and system preference
      state.isDark = action.payload === 'dark' || 
        (action.payload === 'system' && state.systemTheme === 'dark');
    },
    setSystemTheme: (state, action: PayloadAction<'light' | 'dark' | null>) => {
      state.systemTheme = action.payload;
      // Update isDark if current theme is 'system'
      if (state.theme === 'system') {
        state.isDark = action.payload === 'dark';
      }
    },
    initializeTheme: (state, action: PayloadAction<{ theme: Theme; systemTheme: 'light' | 'dark' | null }>) => {
      state.theme = action.payload.theme;
      state.systemTheme = action.payload.systemTheme;
      state.isDark = action.payload.theme === 'dark' || 
        (action.payload.theme === 'system' && action.payload.systemTheme === 'dark');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadThemeFromStorage.fulfilled, (state, action) => {
        state.theme = action.payload.theme;
        state.systemTheme = action.payload.systemTheme;
        state.isDark = action.payload.theme === 'dark' || 
          (action.payload.theme === 'system' && action.payload.systemTheme === 'dark');
      })
      .addCase(saveThemeToStorage.fulfilled, (state, action) => {
        state.theme = action.payload;
        state.isDark = action.payload === 'dark' || 
          (action.payload === 'system' && state.systemTheme === 'dark');
      });
  },
});

export const { setTheme, setSystemTheme, initializeTheme } = themeSlice.actions;

// Async thunk for loading theme from storage
export const loadThemeFromStorage = createAsyncThunk(
  'theme/loadThemeFromStorage',
  async (_, { dispatch }) => {
    try {
      const savedTheme = await AsyncStorage.getItem('app-theme');
      const systemTheme = useColorScheme() || 'light';
      
      const theme = (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) 
        ? savedTheme as Theme 
        : 'system';
      
      return { theme, systemTheme };
    } catch (error) {
      console.log('Error loading theme:', error);
      const systemTheme = useColorScheme() || 'light';
      return { theme: 'system' as Theme, systemTheme };
    }
  }
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
  }
);

export default themeSlice.reducer;
