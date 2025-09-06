import { Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
	const router = useRouter();

	const handleGoHome = () => {
		router.replace('/');
	};

	const handleGoBack = () => {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace('/');
		}
	};

	return (
		<>
			<Stack.Screen options={{ title: 'Không tìm thấy trang' }} />
			<View style={styles.container}>
				<View style={styles.iconContainer}>
					<Ionicons name="sad-outline" size={120} color="#6B7280" />
				</View>

				<Text style={styles.errorCode}>404</Text>
				<Text style={styles.title}>Oops! Trang không tồn tại</Text>
				<Text style={styles.description}>
					Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm
					thời không khả dụng.
				</Text>

				<View style={styles.buttonContainer}>
					<Pressable
						style={[styles.button, styles.primaryButton]}
						onPress={handleGoHome}
					>
						<Ionicons
							name="home"
							size={20}
							color="white"
							style={styles.buttonIcon}
						/>
						<Text style={styles.primaryButtonText}>
							Về trang chủ
						</Text>
					</Pressable>

					<Pressable
						style={[styles.button, styles.secondaryButton]}
						onPress={handleGoBack}
					>
						<Ionicons
							name="arrow-back"
							size={20}
							color="#3B82F6"
							style={styles.buttonIcon}
						/>
						<Text style={styles.secondaryButtonText}>Quay lại</Text>
					</Pressable>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F9FAFB',
		padding: 20,
	},
	iconContainer: {
		marginBottom: 20,
	},
	errorCode: {
		fontSize: 72,
		fontWeight: '900',
		color: '#E5E7EB',
		marginBottom: 10,
		textAlign: 'center',
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 10,
		textAlign: 'center',
	},
	description: {
		fontSize: 16,
		color: '#6B7280',
		textAlign: 'center',
		lineHeight: 24,
		maxWidth: 300,
		marginBottom: 40,
	},
	buttonContainer: {
		width: '100%',
		maxWidth: 300,
		gap: 12,
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		minHeight: 48,
	},
	primaryButton: {
		backgroundColor: '#3B82F6',
	},
	secondaryButton: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: '#D1D5DB',
	},
	buttonIcon: {
		marginRight: 8,
	},
	primaryButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	secondaryButtonText: {
		color: '#3B82F6',
		fontSize: 16,
		fontWeight: '600',
	},
});
