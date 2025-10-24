import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import enCommon from '@/src/locales/en/commons/common.json';
import viCommon from '@/src/locales/vi/commons/common.json';

import enLanguage from '@/src/locales/en/commons/language.json';
import viLanguage from '@/src/locales/vi/commons/language.json';

// Import translation files
import enTheme from '@/src/locales/en/commons/theme.json';
import viTheme from '@/src/locales/vi/commons/theme.json';

import enInterface from '@/src/locales/en/commons/interface.json';
import viInterface from '@/src/locales/vi/commons/interface.json';

import enHeader from '@/src/locales/en/commons/header.json';
import viHeader from '@/src/locales/vi/commons/header.json';

import enWelcome from '@/src/locales/en/auth/welcome.json';
import viWelcome from '@/src/locales/vi/auth/welcome.json';

import enLoginEmail from '@/src/locales/en/auth/login-email.json';
import viLoginEmail from '@/src/locales/vi/auth/login-email.json';

import enConfirmPassword from '@/src/locales/en/auth/confirm-password.json';
import viConfirmPassword from '@/src/locales/vi/auth/confirm-password.json';

import enVerify from '@/src/locales/en/auth/verify.json';
import viVerify from '@/src/locales/vi/auth/verify.json';

import enSignupEmail from '@/src/locales/en/auth/signup-email.json';
import viSignupEmail from '@/src/locales/vi/auth/signup-email.json';

import enNotFound from '@/src/locales/en/commons/not-found.json';
import viNotFound from '@/src/locales/vi/commons/not-found.json';

import enLoginSuccess from '@/src/locales/en/auth/login-success.json';
import viLoginSuccess from '@/src/locales/vi/auth/login-success.json';

import enSignupName from '@/src/locales/en/auth/signup-name.json';
import viSignupName from '@/src/locales/vi/auth/signup-name.json';

import enSignupDetail from '@/src/locales/en/auth/signup-detail.json';
import viSignupDetail from '@/src/locales/vi/auth/signup-detail.json';

import enGender from '@/src/locales/en/commons/gender.json';
import viGender from '@/src/locales/vi/commons/gender.json';

import enSignupAvatar from '@/src/locales/en/auth/signup-avatar.json';
import viSignupAvatar from '@/src/locales/vi/auth/signup-avatar.json';

import enSplash from '@/src/locales/en/commons/splash.json';
import viSplash from '@/src/locales/vi/commons/splash.json';

// Tabs translations
import enTabs from '@/src/locales/en/tabs/tabs.json';
import viTabs from '@/src/locales/vi/tabs/tabs.json';

import enContact from '@/src/locales/en/tabs/contact.json';
import viContact from '@/src/locales/vi/tabs/contact.json';

import enConversations from '@/src/locales/en/tabs/convervations.json';
import viConversations from '@/src/locales/vi/tabs/convervations.json';

import enNewsfeed from '@/src/locales/en/tabs/newsfeed.json';
import viNewsfeed from '@/src/locales/vi/tabs/newsfeed.json';

import enNotification from '@/src/locales/en/tabs/notification.json';
import viNotification from '@/src/locales/vi/tabs/notification.json';

import enUser from '@/src/locales/en/tabs/user.json';
import viUser from '@/src/locales/vi/tabs/user.json';

import enSetting from '@/src/locales/en/user/setting.json';
import viSetting from '@/src/locales/vi/user/setting.json';

import enMessageHeader from '@/src/locales/en/commons/message-header.json';
import viMessageHeader from '@/src/locales/vi/commons/message-header.json';

import enFriendRequest from '@/src/locales/en/user/friend-request.json';
import viFriendRequest from '@/src/locales/vi/user/friend-request.json';

import enAddFriend from '@/src/locales/en/user/add-friend.json';
import viAddFriend from '@/src/locales/vi/user/add-friend.json';

import enGroupCreate from '@/src/locales/en/user/group-create.json';
import viGroupCreate from '@/src/locales/vi/user/group-create.json';

import enSearch from '@/src/locales/en/user/search.json';
import viSearch from '@/src/locales/vi/user/search.json';

import enQR from '@/src/locales/en/user/qr.json';
import viQR from '@/src/locales/vi/user/qr.json';

import enConversation from '@/src/locales/en/user/conversation.json';
import viConversation from '@/src/locales/vi/user/conversation.json';

import enAbout from '@/src/locales/en/user/about.json';
import viAbout from '@/src/locales/vi/user/about.json';

import enAccountSecurity from '@/src/locales/en/user/account-security.json';
import viAccountSecurity from '@/src/locales/vi/user/account-security.json';

import enSupport from '@/src/locales/en/user/support.json';
import viSupport from '@/src/locales/vi/user/support.json';

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

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(LANGUAGE_DETECTOR)
	.use(initReactI18next)
	.init({
		fallbackLng: 'en',
		debug: __DEV__,

		resources: {
		en: {
			common: enCommon,
			language: enLanguage,
			theme: enTheme,
			interface: enInterface,
			header: enHeader,
			'signup-avatar': enSignupAvatar,
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
			tabs: enTabs,
			contact: enContact,
			conversations: enConversations,
			newsfeed: enNewsfeed,
			notification: enNotification,
			user: enUser,
			setting: enSetting,
			'message-header': enMessageHeader,
			'friend-request': enFriendRequest,
			'add-friend': enAddFriend,
			'group-create': enGroupCreate,
			search: enSearch,
			qr: enQR,
			conversation: enConversation,
			about: enAbout,
			'account-security': enAccountSecurity,
			support: enSupport,
		},
		vi: {
			common: viCommon,
			language: viLanguage,
			theme: viTheme,
			interface: viInterface,
			header: viHeader,
			'signup-avatar': viSignupAvatar,
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
			tabs: viTabs,
			contact: viContact,
			conversations: viConversations,
			newsfeed: viNewsfeed,
			notification: viNotification,
			user: viUser,
			setting: viSetting,
			'message-header': viMessageHeader,
			'friend-request': viFriendRequest,
			'add-friend': viAddFriend,
			'group-create': viGroupCreate,
			search: viSearch,
			qr: viQR,
			conversation: viConversation,
			about: viAbout,
			'account-security': viAccountSecurity,
			support: viSupport,
		},
		},

	ns: [
		'common',
		'language',
		'theme',
		'interface',
		'header',
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
		'signup-avatar',
		'tabs',
		'contact',
		'conversations',
		'newsfeed',
		'notification',
		'user',
		'setting',
		'message-header',
		'friend-request',
		'add-friend',
		'group-create',
		'search',
		'qr',
		'conversation',
		'about',
		'account-security',
		'support',
	],
		defaultNS: 'common',

		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
