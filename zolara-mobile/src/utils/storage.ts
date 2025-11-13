import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_DATA: '@zolara_user_data',
  AUTH_TOKEN: '@zolara_auth_token',
};

/**
 * Save user data to AsyncStorage
 * @param userData User data object to store
 */
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(userData);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonValue);
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

/**
 * Get user data from AsyncStorage
 * @returns User data object or null if not found
 */
export const getUserData = async (): Promise<any | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Save authentication token to AsyncStorage
 * @param token Auth token to store
 */
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

/**
 * Get authentication token from AsyncStorage
 * @returns Auth token or null if not found
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Clear all authentication data from AsyncStorage
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.AUTH_TOKEN,
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
