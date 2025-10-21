import { APP_COLOR } from '@/src/utils/constants';
import { ReactNode } from 'react';
import {
	ActivityIndicator,
	Pressable,
	StyleProp,
	Text,
	TextStyle,
	View,
	ViewStyle,
} from 'react-native';

interface IProps {
	title: string;
	onPress: () => void;
	icon?: ReactNode;
	textStyle?: StyleProp<TextStyle>;
	buttonStyle?: StyleProp<ViewStyle>;
	pressStyle?: StyleProp<ViewStyle>;
	disabled?: boolean;
	isLoading?: boolean;
}

const ShareButton = (props: IProps) => {
	const {
		title,
		onPress,
		icon,
		textStyle,
		buttonStyle,
		pressStyle,
		disabled = false,
		isLoading = false,
	} = props;

	return (
		<Pressable
			style={({ pressed }) => [
				{
					opacity:
						pressed === true || isLoading || disabled ? 0.5 : 1,
					alignSelf: 'flex-start', //fit-content
				},
				pressStyle,
			]}
			onPress={onPress}
			disabled={isLoading || disabled}
		>
			<View
				className="flex-row items-center justify-center gap-5 py-[13px] px-[15px] rounded-[25px] bg-secondary-light dark:bg-secondary-dark"
				style={buttonStyle}
			>
				{icon}
				<Text className='text-[18px] font-extrabold text-secondary-dark dark:text-secondary-light' style={textStyle}>{title}</Text>
				{isLoading && <ActivityIndicator color={APP_COLOR.GRAY_200} />}
			</View>
		</Pressable>
	);
};

export default ShareButton;
