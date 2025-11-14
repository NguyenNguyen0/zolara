import 'dotenv/config';
import appJson from './app.json';

export default ({ config }) => ({
	...config,
	name: 'Zolara',
	slug: 'zolara',
	version: appJson.expo.version,
	orientation: appJson.expo.orientation,
	icon: appJson.expo.icon,
	scheme: appJson.expo.scheme,
	userInterfaceStyle: appJson.expo.userInterfaceStyle,
	newArchEnabled: appJson.expo.newArchEnabled,
	plugins: appJson.expo.plugins,
	experiments: appJson.expo.experiments,

	ios: {
		...(appJson.expo.ios || {}),
		bundleIdentifier: 'zolara.mobile',
		supportsTablet: true,
		buildNumber: process.env.IOS_BUILD_NUMBER || '1',
		infoPlist: {
			NSCameraUsageDescription: "This app uses camera for profile photos and sharing images.",
			NSPhotoLibraryUsageDescription: "This app accesses your photo library to select images for sharing.",
			NSMicrophoneUsageDescription: "This app uses microphone for voice calls and video calls."
		}
	},

	android: {
		...(appJson.expo.android || {}),
		package: 'zolara.mobile',
		adaptiveIcon: appJson.expo.android?.adaptiveIcon,
		edgeToEdgeEnabled: true,
		versionCode: parseInt(process.env.ANDROID_VERSION_CODE || '1'),
		permissions: [
			"CAMERA",
			"RECORD_AUDIO",
			"READ_EXTERNAL_STORAGE",
			"WRITE_EXTERNAL_STORAGE"
		]
	},

	web: {
		...(appJson.expo.web || {}),
	},

	extra: {
		...appJson.expo.extra,
		eas: {
			projectId: '2cf3e03d-e8a7-4de9-b7d5-83ea41666a63',
		},
		FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
		FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
		FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
		FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
		FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
		FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
		AGORA_APP_ID: process.env.AGORA_APP_ID,
		API_BASE_URL: process.env.API_BASE_URL,
		BUILD_VARIANT: process.env.NODE_ENV || 'development',
	},
});
