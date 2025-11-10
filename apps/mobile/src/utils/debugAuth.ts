import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootState } from '@/src/store';

// Lưu reference đến getState function
let getStateRef: (() => RootState) | null = null;

/**
 * Setup getState function từ store
 * Gọi function này trong app initialization
 */
export const setupDebugAuth = (getState: () => RootState) => {
	getStateRef = getState;
};

/**
 * Debug utility: Hiển thị thông tin Auth từ AsyncStorage và Redux
 * Gọi function này ở bất kỳ đâu cần kiểm tra auth state
 * 
 * @example
 * import { debugAuth } from '@/src/utils/debugAuth';
 * 
 * // Gọi sau khi login
 * await debugAuth();
 * 
 * // Gọi sau khi gọi API
 * const result = await someApi();
 * await debugAuth();
 */
export const debugAuth = async () => {
	console.log('\n========================================');
	console.log('🔍 DEBUG: AUTH STATE');
	console.log('========================================\n');

	// 1. Hiển thị AsyncStorage
	try {
		const accessToken = await AsyncStorage.getItem('accessToken');
		const userId = await AsyncStorage.getItem('userId');
		
		console.log('📦 AsyncStorage:');
		console.log(`  - accessToken: ${accessToken ? accessToken.substring(0, 50) + '...' : 'null'}`);
		console.log(`  - userId: ${userId || 'null'}`);
	} catch (error) {
		console.error('❌ Error reading AsyncStorage:', error);
	}

	// 2. Hiển thị Redux State
	if (getStateRef) {
		try {
			const state = getStateRef();
			console.log('\n🔴 Redux Auth State:');
			console.log(`  - isAuthenticated: ${state.auth.isAuthenticated}`);
			console.log(`  - user:`, state.auth.user ? {
				id: state.auth.user.id,
				email: state.auth.user.email,
				firstName: state.auth.user.firstName,
				lastName: state.auth.user.lastName,
				avatar: state.auth.user.avatar,
				bio: state.auth.user.bio,
				gender: state.auth.user.gender,
				dob: state.auth.user.dob,
				roleId: state.auth.user.roleId,
				roleName: state.auth.user.roleName,
				emailVerified: state.auth.user.emailVerified,
				isActive: state.auth.user.isActive,
				isLocked: state.auth.user.isLocked,
				lastActivity: state.auth.user.lastActivity,
				createdAt: state.auth.user.createdAt,
				updatedAt: state.auth.user.updatedAt,
			} : 'null');
		} catch (error) {
			console.error('❌ Error reading Redux state:', error);
		}
	} else {
		console.log('\n⚠️  Redux store not initialized yet');
	}

	console.log('\n========================================\n');
};
