import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import enWelcome from '@/src/locales/en/welcome.json';
import viWelcome from '@/src/locales/vi/welcome.json';

import enCommon from '@/src/locales/en/common.json';
import viCommon from '@/src/locales/vi/common.json';

import enLoginEmail from '@/src/locales/en/login-email.json';
import viLoginEmail from '@/src/locales/vi/login-email.json';

import enConfirmPassword from '@/src/locales/en/confirm-password.json';
import viConfirmPassword from '@/src/locales/vi/confirm-password.json';

import enVerify from '@/src/locales/en/verify.json';
import viVerify from '@/src/locales/vi/verify.json';

import enSignupEmail from '@/src/locales/en/signup-email.json';
import viSignupEmail from '@/src/locales/vi/signup-email.json';

const LANGUAGE_DETECTOR = {
	type: 'languageDetector' as const,
	async: true,
	detect: async (callback: (lng: string) => void) => {
		try {
			const savedLanguage = await AsyncStorage.getItem('user-language');
			if (savedLanguage) {
				callback(savedLanguage);
			} else {
				callback('en'); // Default language
			}
		} catch (error) {
			callback('en');
		}
	},
	init: () => {},
	cacheUserLanguage: async (lng: string) => {
		try {
			await AsyncStorage.setItem('user-language', lng);
		} catch (error) {
			console.log('Error saving language', error);
		}
	},
};

i18n.use(LANGUAGE_DETECTOR)
	.use(initReactI18next)
	.init({
		fallbackLng: 'en',
		debug: __DEV__,

		resources: {
			en: {
				welcome: enWelcome,
				common: enCommon,
				'login-email': enLoginEmail,
				'confirm-password': enConfirmPassword,
				verify: enVerify,
				'signup-email': enSignupEmail,
			},
			vi: {
				welcome: viWelcome,
				common: viCommon,
				'login-email': viLoginEmail,
				'confirm-password': viConfirmPassword,
				verify: viVerify,
				'signup-email': viSignupEmail,
			},
		},

		ns: ['welcome', 'common', 'login-email', 'confirm-password', 'verify', 'signup-email'],
		defaultNS: 'common',

		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
