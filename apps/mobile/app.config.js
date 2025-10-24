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
	},

	android: {
		...(appJson.expo.android || {}),
		package: 'zolara.mobile',
		adaptiveIcon: appJson.expo.android?.adaptiveIcon,
		edgeToEdgeEnabled: true,
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
	},
});
