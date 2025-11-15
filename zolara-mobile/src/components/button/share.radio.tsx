import { Link } from 'expo-router';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IProps {
	questionText: string;
	linkText?: string;
	linkPath?: string;
	questionColor?: any;
	linkColor?: any;
	isChecked?: boolean;
	onRadioPress?: () => void;
	radioColor?: any;
}

const ShareRadio = (props: IProps) => {
	const {
		questionText,
		linkText,
		linkPath,
		questionColor: textColor = 'black',
		linkColor = '#007AFF',
		isChecked = false,
		onRadioPress,
		radioColor = '#007AFF',
	} = props;

	return (
		<TouchableOpacity
			className="flex-row items-start mb-4"
			onPress={onRadioPress}
			activeOpacity={0.7}
		>
			<View
				className="mr-3 items-center justify-center"
				style={{
					width: 20,
					height: 20,
					borderWidth: 2,
					borderRadius: 4,
					borderColor: isChecked ? radioColor : '#ccc',
					backgroundColor: isChecked ? radioColor : 'transparent',
				}}
			>
				{isChecked && (
					<Ionicons
						name="checkmark"
						size={14}
						color="white"
					/>
				)}
			</View>
			<View className="flex-1 flex-row flex-wrap items-center">
				<Text
					className="text-sm leading-5"
					style={{ color: textColor }}
				>
					{questionText}{` `}
				</Text>
				{linkPath && linkText && (
					<Link href={linkPath as any}>
						<Text
							className="text-sm font-bold underline"
							style={{ color: linkColor }}
						>
							{linkText}
						</Text>
					</Link>
				)}
			</View>
		</TouchableOpacity>
	);
};

export default ShareRadio;