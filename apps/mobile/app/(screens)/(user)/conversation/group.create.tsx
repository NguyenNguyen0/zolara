import NavigateHeader from '@/src/components/commons/navigate.header';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GroupCreate() {
	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader
				title={'Group Creation'}
				showSearch
				showQRScanner
				showCreateGroup
			/>
		</SafeAreaView>
	);
}
