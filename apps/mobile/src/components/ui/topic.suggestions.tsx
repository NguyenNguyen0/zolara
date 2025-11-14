import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

interface TopicSuggestionsProps {
	topics: string[];
	isLoading: boolean;
	onTopicSelect: (topic: string) => void;
	onRefresh: () => void;
}

export default function TopicSuggestions({
	topics,
	isLoading,
	onTopicSelect,
	onRefresh
}: TopicSuggestionsProps) {
	const { t } = useTranslation('chatbot');
	if (isLoading) {
		return (
			<View className="p-4 bg-white dark:bg-gray-800">
				<View className="flex-row items-center justify-center py-8">
					<ActivityIndicator size="small" color="#6B7280" />
					<Text className="ml-2 text-gray-600 dark:text-gray-400">
						{t('topics.loading')}
					</Text>
				</View>
			</View>
		);
	}

	if (topics.length === 0) {
		return (
			<View className="p-4 bg-white dark:bg-gray-800">
				<View className="items-center py-8">
					<Text className="text-gray-600 dark:text-gray-400 text-center mb-4">
						{t('topics.empty')}
					</Text>
					<TouchableOpacity
						onPress={onRefresh}
						className="bg-blue-500 px-4 py-2 rounded-lg"
					>
						<Text className="text-white font-medium">{t('topics.retry')}</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	return (
		<View className="p-4 bg-white dark:bg-gray-800">
			<View className="flex-row items-center justify-between mb-3">
				<Text className="text-lg font-semibold text-dark-mode dark:text-light-mode">
					{t('topics.title')}
				</Text>
				<TouchableOpacity onPress={onRefresh}>
					<Text className="text-blue-500 text-sm">{t('topics.refresh')}</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
			>
				{topics.map((topic, index) => (
					<TouchableOpacity
						key={index}
						onPress={() => onTopicSelect(topic)}
						className="bg-blue-100 dark:bg-blue-900 px-4 py-3 rounded-lg mb-2"
						activeOpacity={0.7}
					>
						<Text className="text-blue-800 dark:text-blue-200 text-sm font-medium">
							{topic}
						</Text>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);
}
