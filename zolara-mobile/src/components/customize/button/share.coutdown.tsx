import React, { memo, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CountdownButtonProps {
	onResend: () => void;
	initialCountdown?: number;
	containerClassName?: string;
	disabled?: boolean;
}

const ShareCountdownButton = memo(
	({
		onResend,
		initialCountdown = 30,
		containerClassName = 'flex-row justify-center items-center mt-5',
		disabled = false,
	}: CountdownButtonProps) => {
		const [countdown, setCountdown] = useState(initialCountdown);
		const [isResendDisabled, setIsResendDisabled] = useState(true);

		// Countdown effect
		useEffect(() => {
			let timer: ReturnType<typeof setTimeout>;
			if (countdown > 0) {
				timer = setTimeout(() => {
					setCountdown(countdown - 1);
				}, 1000);
			} else {
				setIsResendDisabled(false);
			}
			return () => clearTimeout(timer);
		}, [countdown]);

		const handleResendCode = useCallback(() => {
			if (!isResendDisabled && !disabled) {
				onResend();
				setCountdown(initialCountdown);
				setIsResendDisabled(true);
			}
		}, [isResendDisabled, onResend, initialCountdown, disabled]);

		// Reset countdown when component mounts or when initialCountdown changes
		useEffect(() => {
			setCountdown(initialCountdown);
			setIsResendDisabled(true);
		}, [initialCountdown]);

		const isButtonDisabled = isResendDisabled || disabled;

		return (
			<View className={containerClassName}>
				<Text className="text-base text-gray-900">
					Gửi lại mã{' '}
				</Text>
				<TouchableOpacity
					onPress={handleResendCode}
					disabled={isButtonDisabled}
					activeOpacity={isButtonDisabled ? 1 : 0.7}
				>
					<Text
						className={`text-base font-semibold ${
							isButtonDisabled
								? 'text-gray-500'
								: 'text-blue-500'
						}`}
					>
						{isResendDisabled
							? `Gọi lại cho tôi (${countdown}s)`
							: 'Gọi lại cho tôi'}
					</Text>
				</TouchableOpacity>
			</View>
		);
	},
);

ShareCountdownButton.displayName = 'CountdownButton';

export default ShareCountdownButton;
