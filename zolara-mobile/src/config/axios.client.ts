import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppDispatch, RootState } from '@/src/store';
import { updateTokenManually } from '@/src/store/slices/authSlice';
import { logout } from '@/src/store/slices/authSlice';

// Types
export interface ApiResponse<T> {
	statusCode: number;
	message: string;
	data: T;
	errorCode?: string;
}

type FailedRequest = {
	resolve: () => void;
	reject: (reason?: unknown) => void;
};

// Setup dispatch và getState từ store để sử dụng trong interceptor
let dispatchRef: AppDispatch;
let getStateRef: () => RootState;

export const setupAxiosInterceptors = (dispatch: AppDispatch, getState: () => RootState) => {
	dispatchRef = dispatch;
	getStateRef = getState;
};

// Cấu hình mặc định cho các request
const instance = axios.create({
	baseURL: 'http://10.0.2.2:3000', // Android Emulator: 10.0.2.2 = localhost của máy host
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Interceptor: Tự động gắn Access Token vào mỗi request
instance.interceptors.request.use(
	async (config: InternalAxiosRequestConfig) => {
		try {
			const accessToken = await AsyncStorage.getItem('accessToken');
			if (accessToken) {
				config.headers.Authorization = `Bearer ${accessToken}`;
			}
		} catch (error) {
			// Silent error
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Cơ chế hàng đợi xử lý request bị lỗi 401 trong khi refresh token
let failedQueue: FailedRequest[] = [];
let isRefreshing = false;

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (token) resolve();
		else reject(error);
	});
	failedQueue = [];
};

// Interceptor: Xử lý lỗi 401 và refresh token tự động
instance.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		// Check lỗi có phải thuộc lỗi JWT Token
		const { response } = error;
		const errorCode = (response?.data as ApiResponse<null>)?.errorCode;
		const isUnauthorized =
			response?.status === 401 &&
			(errorCode === 'UNAUTHORIZED' || errorCode === 'ACCESS_DENIED');

		if (isUnauthorized && !originalRequest._retry) {
			originalRequest._retry = true;

			// Nếu đang refresh, đẩy request vào queue
			if (isRefreshing) {
				return new Promise<void>((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then(() => instance(originalRequest))
					.catch((err) => Promise.reject(err));
			}

			isRefreshing = true;

			try {
				// Lấy uid từ storage
				const userId = await AsyncStorage.getItem('userId');
				if (!userId) {
					throw new Error('No user ID found');
				}

				// Gọi API refresh token
				const response = await axios.post<ApiResponse<{ accessToken: string }>>(
					`${instance.defaults.baseURL}/api/auth/refresh`,
					{ uid: userId }
				);

				const newAccessToken = response.data.data.accessToken;

				// Lưu token mới
				await AsyncStorage.setItem('accessToken', newAccessToken);

				// Cập nhật token vào Redux
				if (dispatchRef) {
					dispatchRef(updateTokenManually(newAccessToken));
				}

				// Xử lý queue
				processQueue(null, newAccessToken);

				// Retry request ban đầu với token mới
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				return instance(originalRequest);
			} catch (refreshError) {
				// Refresh token thất bại -> logout
				processQueue(refreshError, null);
				
				if (dispatchRef) {
					dispatchRef(logout());
				}

				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);

export default instance;
