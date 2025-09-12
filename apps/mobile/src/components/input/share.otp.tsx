import React, { memo } from 'react';
import { View } from 'react-native';
import OTPTextView from 'react-native-otp-textinput';
import { APP_COLOR } from '@/src/utils/constants';

interface OTPInputProps {
	otp: string;
	onOTPChange: (text: string) => void;
	otpInputRef: React.RefObject<OTPTextView | null>;
	inputCount?: number;
	containerClassName?: string;
}

const OTPInput = memo(
	({
		otp,
		onOTPChange,
		otpInputRef,
		inputCount = 6,
		containerClassName = 'items-center mb-8',
	}: OTPInputProps) => {
		return (
			<View className={containerClassName}>
				<OTPTextView
					ref={otpInputRef}
					handleTextChange={onOTPChange}
					containerStyle={{
						flexDirection: 'row',
						justifyContent: 'center',
					}}
					textInputStyle={{
						borderWidth: 3,
						borderRadius: 8,
						width: 50,
						height: 50,
						marginHorizontal: 5,
						borderColor: APP_COLOR.GRAY_200,
						backgroundColor: APP_COLOR.LIGHT_MODE,
					}}
					inputCount={inputCount}
					keyboardType="numeric"
					tintColor={APP_COLOR.PRIMARY}
					offTintColor={APP_COLOR.GRAY_700}
				/>
			</View>
		);
	},
);

OTPInput.displayName = 'OTPInput';

export default OTPInput;
