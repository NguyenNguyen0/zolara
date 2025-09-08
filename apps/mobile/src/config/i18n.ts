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

import enNotFound from '@/src/locales/en/not-found.json';
import viNotFound from '@/src/locales/vi/not-found.json';

import enLoginSuccess from '@/src/locales/en/login-success.json';
import viLoginSuccess from '@/src/locales/vi/login-success.json';

import enSignupName from '@/src/locales/en/signup-name.json';
import viSignupName from '@/src/locales/vi/signup-name.json';
import enSignupDetail from '@/src/locales/en/signup-detail.json';
import viSignupDetail from '@/src/locales/vi/signup-detail.json';

import enGender from '@/src/locales/en/gender.json';
import viGender from '@/src/locales/vi/gender.json';

import enSplash from '@/src/locales/en/splash.json';
import viSplash from '@/src/locales/vi/splash.json';

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
		} catch {
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
				common: enCommon,
				splash: enSplash,
				welcome: enWelcome,
				'login-email': enLoginEmail,
				'confirm-password': enConfirmPassword,
				verify: enVerify,
				'signup-email': enSignupEmail,
				'not-found': enNotFound,
				'login-success': enLoginSuccess,
				'signup-name': enSignupName,
				'signup-detail': enSignupDetail,
				gender: enGender,
			},
			vi: {
				common: viCommon,
				splash: viSplash,
				welcome: viWelcome,
				'login-email': viLoginEmail,
				'confirm-password': viConfirmPassword,
				verify: viVerify,
				'signup-email': viSignupEmail,
				'not-found': viNotFound,
				'login-success': viLoginSuccess,
				'signup-name': viSignupName,
				'signup-detail': viSignupDetail,
				gender: viGender,
			},
		},

		ns: [
			'common',
			'welcome',
			'splash',
			'login-email',
			'confirm-password',
			'verify',
			'signup-email',
			'not-found',
			'login-success',
			'signup-name',
			'signup-detail',
			'gender',
		],
		defaultNS: 'common',

		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
