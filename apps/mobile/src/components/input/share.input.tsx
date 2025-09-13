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

const styles = StyleSheet.create({
	inputGroup: { gap: 10 },
	text: { fontSize: 20 },
	input: {
		borderWidth: 1,
		paddingHorizontal: 15,
		paddingVertical: 15,
		borderRadius: 15,
	},
	eye: { position: 'absolute', right: 15, top: 15 },
});

interface IProps {
	title?: string;
	keyboardType?: KeyboardType;
	secureTextEntry?: boolean;
	value: any;
	onBlur?: (v: any) => void;
	onTextChange?: (v: any) => void;
	error?: string;
	touched?: any;
	editable?: boolean;
	placeholder?: string;
	inputStyle?: StyleProp<TextStyle>;
}

const ShareInput = (props: IProps) => {
	const [isFocus, setIsFocus] = useState<boolean>(false);
	const [isShowPassword, setIsShowPassword] = useState<boolean>(false);

	const {
		title,
		keyboardType,
		secureTextEntry = false,
		value,
		onBlur,
		onTextChange,
		error,
		touched,
		editable = true,
		placeholder,
		inputStyle,
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
				<TextInput
					className="bg-transparent dark:bg-secondary-light"
					value={value}
					keyboardType={keyboardType}
					placeholder={placeholder}
					style={[
						styles.input,
						{ borderColor },
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
				/>
				{touched && error && (
					<Text className="m-2 text-red-600 font-semibold">
						{error}
					</Text>
				)}
				{secureTextEntry && (
					<Entypo
						onPress={() => setIsShowPassword(!isShowPassword)}
						style={styles.eye}
						name={isShowPassword ? 'eye-with-line' : 'eye'}
						size={20}
						color="black"
					/>
				)}
			</View>
		</View>
	);
};

export default ShareInput;
