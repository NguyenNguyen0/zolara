import { APP_COLOR } from '@/src/utils/constants';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

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
			<Text className='text-black dark:text-white'>{questionText}</Text>
			<Link href={path as any}>
				<Text onPress={onPress} className='font-bold' style={{ color: linkColor }}>
					{questionBtnName}
				</Text>
			</Link>
		</View>
	);
};

export default ShareQuestion;
