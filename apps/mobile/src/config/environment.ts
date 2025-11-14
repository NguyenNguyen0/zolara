import Config from 'expo-constants';

const expoConfig = Config?.expoConfig?.extra || {};

const env = {
	API_BASE_URL: expoConfig?.API_BASE_URL || 'http://10.0.2.2:3000', // Android Emulator: 10.0.2.2 = localhost của máy host
} as const;

export default { env };
