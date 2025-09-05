import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

const RootPage = () => {
	useEffect(() => {
		async function prepare() {
			// TODO: Update logic navigate route in future!
			await SplashScreen.hideAsync();
			router.replace('/(auth)/welcome');
		}

		prepare();
	}, []);

	return <></>;
};

export default RootPage;
