import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@/src/store';
import { getCurrentUserThunk } from '@/src/store/slices/authSlice';
import { APP_COLOR } from '@/src/utils/constants';

const RootPage = () => {
	const router = useRouter();
	const [isChecking, setIsChecking] = useState(true);
	const [redirectTo, setRedirectTo] = useState<string | null>(null);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const accessToken = await AsyncStorage.getItem('accessToken');

				if (accessToken) {
					try {
						// Validate token bằng API /me
						await store.dispatch(getCurrentUserThunk()).unwrap();
						setRedirectTo('/(screens)/(tabs)/conversation');
					} catch (error: any) {
						await AsyncStorage.multiRemove(['accessToken', 'userId']);
						setRedirectTo('/(screens)/(auth)/welcome');
					}
				} else {
					setRedirectTo('/(screens)/(auth)/welcome');
				}
			} catch (error) {
				setRedirectTo('/(screens)/(auth)/welcome');
			} finally {
				setIsChecking(false);
			}
		};

		checkAuth();
	}, []);

	if (isChecking) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_COLOR.LIGHT_MODE }}>
				<ActivityIndicator size="large" color={APP_COLOR.PRIMARY} />
			</View>
		);
	}

	if (redirectTo) {
		return <Redirect href={redirectTo as any} />;
	}

	// Fallback
	return <Redirect href="/(screens)/(auth)/welcome" />;
};

export default RootPage;
