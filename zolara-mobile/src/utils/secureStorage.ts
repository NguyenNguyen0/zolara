import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage utility using expo-secure-store
 * All values are stored securely on the device
 */
class SecureStorage {
	/**
	 * Save a value to secure storage
	 */
	async setItem(key: string, value: string): Promise<void> {
		try {
			await SecureStore.setItemAsync(key, value);
		} catch (error) {
			console.error(`Error saving ${key} to secure storage:`, error);
			throw error;
		}
	}

	/**
	 * Get a value from secure storage
	 */
	async getItem(key: string): Promise<string | null> {
		try {
			return await SecureStore.getItemAsync(key);
		} catch (error) {
			console.error(`Error reading ${key} from secure storage:`, error);
			return null;
		}
	}

	/**
	 * Remove a value from secure storage
	 */
	async removeItem(key: string): Promise<void> {
		try {
			await SecureStore.deleteItemAsync(key);
		} catch (error) {
			console.error(`Error removing ${key} from secure storage:`, error);
			throw error;
		}
	}

	/**
	 * Clear all items from secure storage (use with caution)
	 */
	async clear(): Promise<void> {
		// Note: expo-secure-store doesn't have a built-in clear all method
		// You need to manually delete each key you're using
		const keys = ['app-theme', 'app-language'];
		
		try {
			await Promise.all(keys.map(key => this.removeItem(key)));
		} catch (error) {
			console.error('Error clearing secure storage:', error);
			throw error;
		}
	}
}

export const secureStorage = new SecureStorage();
