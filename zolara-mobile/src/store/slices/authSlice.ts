import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	loginApi,
	signupApi,
	getMeApi,
	type LoginRequest,
	type SignupRequest,
	type UserProfile,
} from '@/src/services/authApi';
import { debugAuth } from '@/src/utils/debugAuth';

// ============================================================
// Types
// ============================================================
export interface AuthState {
	user: UserProfile | null;
	accessToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

// ============================================================
// Initial State
// ============================================================
const initialState: AuthState = {
	user: null,
	accessToken: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
};

// ============================================================
// Async Thunks
// ============================================================

/**
 * Login action
 */
export const loginThunk = createAsyncThunk(
	'auth/login',
	async (credentials: LoginRequest, { rejectWithValue }) => {
		try {
			const response = await loginApi(credentials);
			const { accessToken, id, email, roleId, roleName } = response.data.data;

			// Xóa các token cũ không cần thiết từ Firebase
			await AsyncStorage.multiRemove([
				'@zolara_auth_token',
				'access_token',
			]);

			// Chỉ lưu accessToken và userId vào AsyncStorage
			await AsyncStorage.setItem('accessToken', accessToken);
			await AsyncStorage.setItem('userId', id);

			// Lấy thông tin user chi tiết
			const userResponse = await getMeApi();
			const user = userResponse.data.data;

			return {
				accessToken,
				user,
			};
		} catch (error: any) {
			const message =
				error.response?.data?.message || error.message || 'Login failed';
			return rejectWithValue(message);
		}
	}
);

/**
 * Signup action
 */
export const signupThunk = createAsyncThunk(
	'auth/signup',
	async (credentials: SignupRequest, { rejectWithValue }) => {
		try {
			const response = await signupApi(credentials);
			const { id, email, roleId, roleName } = response.data.data;

			// Sau khi signup, cần login để lấy accessToken
			// Vì signup response không trả về accessToken
			const loginResponse = await loginApi(credentials);
			const { accessToken } = loginResponse.data.data;

			// Lưu token và userId vào AsyncStorage
			await AsyncStorage.setItem('accessToken', accessToken);
			await AsyncStorage.setItem('userId', id);

			// Lấy thông tin user chi tiết
			const userResponse = await getMeApi();
			const user = userResponse.data.data;

			return {
				accessToken,
				user,
			};
		} catch (error: any) {
			const message =
				error.response?.data?.message || error.message || 'Signup failed';
			return rejectWithValue(message);
		}
	}
);

/**
 * Get current user (dùng khi app khởi động để check auth)
 */
export const getCurrentUserThunk = createAsyncThunk(
	'auth/getCurrentUser',
	async (_, { rejectWithValue }) => {
		try {
			const accessToken = await AsyncStorage.getItem('accessToken');
			if (!accessToken) {
				throw new Error('No access token found');
			}

			const userResponse = await getMeApi();
			const user = userResponse.data.data;

			return {
				accessToken,
				user,
			};
		} catch (error: any) {
			const message =
				error.response?.data?.message ||
				error.message ||
				'Failed to get current user';
			return rejectWithValue(message);
		}
	}
);

/**
 * Logout action
 */
export const logoutThunk = createAsyncThunk('auth/logout', async () => {
	// Xóa token khỏi AsyncStorage (bao gồm cả các token Firebase không cần thiết)
	await AsyncStorage.multiRemove([
		'accessToken',
		'userId',
		'@zolara_auth_token',
		'access_token',
	]);
});

// ============================================================
// Slice
// ============================================================
const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		// Action để update token manual (dùng trong axios interceptor)
		updateTokenManually: (state, action: PayloadAction<string>) => {
			state.accessToken = action.payload;
		},
		// Action để logout manual
		logout: (state) => {
			state.user = null;
			state.accessToken = null;
			state.isAuthenticated = false;
			state.error = null;
			// Xóa từ AsyncStorage
			AsyncStorage.multiRemove([
				'accessToken',
				'userId',
				'@zolara_auth_token',
				'access_token',
			]);
		},
		// Clear error
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// Login
		builder
			.addCase(loginThunk.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(loginThunk.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isAuthenticated = true;
				state.accessToken = action.payload.accessToken;
				state.user = action.payload.user;
				state.error = null;
				
				// Debug: Kiểm tra auth state sau khi login
				debugAuth();
			})
			.addCase(loginThunk.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});

		// Signup
		builder
			.addCase(signupThunk.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(signupThunk.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isAuthenticated = true;
				state.accessToken = action.payload.accessToken;
				state.user = action.payload.user;
				state.error = null;
			})
			.addCase(signupThunk.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});

		// Get Current User
		builder
			.addCase(getCurrentUserThunk.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(getCurrentUserThunk.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isAuthenticated = true;
				state.accessToken = action.payload.accessToken;
				state.user = action.payload.user;
				state.error = null;
				
				// Debug: Kiểm tra auth state sau khi get current user
				debugAuth();
			})
			.addCase(getCurrentUserThunk.rejected, (state, action) => {
				state.isLoading = false;
				state.isAuthenticated = false;
				state.user = null;
				state.accessToken = null;
				state.error = action.payload as string;
			});

		// Logout
		builder.addCase(logoutThunk.fulfilled, (state) => {
			state.user = null;
			state.accessToken = null;
			state.isAuthenticated = false;
			state.isLoading = false;
			state.error = null;
		});
	},
});

// ============================================================
// Export actions và reducer
// ============================================================
export const { updateTokenManually, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
