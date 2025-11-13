import { APP_COLOR } from '@/src/utils/constants';
import Entypo from '@expo/vector-icons/Entypo';
import { useState } from 'react';
import {
	KeyboardType,
	StyleProp,
	StyleSheet,
	Text,
	TextInput,
	TextStyle,
	View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const styles = StyleSheet.create({
	inputGroup: { gap: 10 },
	text: { fontSize: 20 },
	inputContainer: {
		position: 'relative',
		flexDirection: 'row',
		alignItems: 'center',
	},
	input: {
		flex: 1,
		borderWidth: 1,
		paddingHorizontal: 15,
		paddingVertical: 15,
		borderRadius: 15,
	},
	iconContainer: {
		position: 'absolute',
		right: 15,
		top: 0,
		bottom: 0,
		justifyContent: 'center',
	},
});

interface IProps {
	title?: string;
	keyboardType?: KeyboardType;
	secureTextEntry?: boolean;
	clear?: boolean;
	value: any;
	onBlur?: (v: any) => void;
	onTextChange?: (v: any) => void;
	error?: string;
	touched?: any;
	editable?: boolean;
	placeholder?: string;
	inputStyle?: StyleProp<TextStyle>;
	placeholderTextColor?: string;
	autoFocus?: boolean;
}

const ShareInput = (props: IProps) => {
	const [isFocus, setIsFocus] = useState<boolean>(false);
	const [isShowPassword, setIsShowPassword] = useState<boolean>(false);

	const {
		title,
		keyboardType,
		secureTextEntry = false,
		clear = false,
		value,
		onBlur,
		onTextChange,
		error,
		touched,
		editable = true,
		placeholder,
		inputStyle,
		placeholderTextColor,
		autoFocus = false
	} = props;

	const borderColor =
		touched && error
			? '#ef4444' // Tailwind red-500
			: isFocus
				? APP_COLOR.PRIMARY
				: APP_COLOR.GRAY_700;

	return (
		<View style={styles.inputGroup}>
			{title && <Text style={styles.text}>{title}</Text>}
			<View>
				<View style={styles.inputContainer}>
					<TextInput
						className="bg-transparent dark:bg-secondary-light"
						value={value}
						keyboardType={keyboardType}
						placeholder={placeholder}
						style={[
							styles.input,
							{ borderColor },
							{ paddingRight: (secureTextEntry || (clear && !!value)) ? 45 : undefined },
							inputStyle,
						]}
						onFocus={() => setIsFocus(true)}
						onBlur={(e) => {
							if (onBlur) {
								onBlur(e);
							}
							setIsFocus(false);
						}}
						editable={editable}
						onChangeText={onTextChange}
						secureTextEntry={secureTextEntry && !isShowPassword}
						placeholderTextColor={placeholderTextColor}
						autoFocus={autoFocus}
					/>
					{secureTextEntry && (
						<View style={styles.iconContainer}>
							<Entypo
								onPress={() => setIsShowPassword(!isShowPassword)}
								name={isShowPassword ? 'eye-with-line' : 'eye'}
								size={20}
								color="black"
							/>
						</View>
					)}
					{!secureTextEntry && clear && !!value && (
						<View style={styles.iconContainer}>
							<Ionicons
								onPress={() => onTextChange && onTextChange('')}
								name="close-circle"
								size={20}
								color={APP_COLOR.GRAY_700}
							/>
						</View>
					)}
				</View>
				{touched && error && (
					<Text className="m-2 text-red-600 font-semibold">
						{error}
					</Text>
				)}
			</View>
		</View>
	);
};

export default ShareInput;