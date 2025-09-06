import React, { memo } from 'react';
import { View } from 'react-native';
import OTPTextView from 'react-native-otp-textinput';
import { APP_COLOR } from '@/src/utils/constants';

interface OTPInputProps {
	isDark: boolean;
	otp: string;
	onOTPChange: (text: string) => void;
	otpInputRef: React.RefObject<OTPTextView | null>;
	inputCount?: number;
	containerClassName?: string;
}

const OTPInput = memo(
	({
		isDark,
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
						borderColor: isDark
							? APP_COLOR.GREYLIGHT
							: APP_COLOR.GREYLIGHT,
						backgroundColor: APP_COLOR.WHITE,
					}}
					inputCount={inputCount}
					keyboardType="numeric"
					tintColor={APP_COLOR.PRIMARY}
					offTintColor={APP_COLOR.GREYDARK}
				/>
			</View>
		);
	},
);

OTPInput.displayName = 'OTPInput';

export default OTPInput;
