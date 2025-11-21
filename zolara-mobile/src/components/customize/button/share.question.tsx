import { APP_COLOR } from '@/utils/constants';
import { Text, View, TouchableOpacity } from 'react-native';

interface IProps {
	questionText: string;
	linkName: string;
	path?: string;
	linkColor?: any;
	onPress?: () => void;
}

const ShareQuestion = (props: IProps) => {
	const {
		questionText,
		linkName: questionBtnName,
		path,
		linkColor = APP_COLOR.PRIMARY,
		onPress,
	} = props;
	return (
		<View className='my-[5px] flex-row gap-[5px]'>
			<Text className='text-black'>{questionText}</Text>
			<TouchableOpacity onPress={onPress || (() => {})}>
				<Text className='font-bold' style={{ color: linkColor }}>
					{questionBtnName}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export default ShareQuestion;
