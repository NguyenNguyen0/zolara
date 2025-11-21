import { View, Text } from 'react-native';

interface TimeStampProps {
	time: string;
}

export default function MessageTime({ time }: TimeStampProps) {
	return (
		<View className="items-center my-2">
			<View className="bg-gray-400 px-4 py-1 rounded-full">
				<Text className="text-white text-xs">{time}</Text>
			</View>
		</View>
	);
}
