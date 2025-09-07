import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

interface IProps {
	questionText: string;
	linkName: string;
	path?: string;
	questionColor?: any;
	linkColor?: any;
}

const ShareQuestionButton = (props: IProps) => {
	const {
		questionText,
		linkName: questionBtnName,
		path,
		questionColor: textColor = 'black',
		linkColor = 'black',
	} = props;
	return (
		<View style={styles.container}>
			<Text style={{ color: textColor }}>{questionText}</Text>
			<Link href={path as any}>
				<Text style={[styles.questionBtnName, { color: linkColor }]}>
					{questionBtnName}
				</Text>
			</Link>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 5,
		flexDirection: 'row',
		gap: 5,
	},
	questionBtnName: {
		fontWeight: '700',
		// textDecorationLine: "underline",
	},
});

export default ShareQuestionButton;
