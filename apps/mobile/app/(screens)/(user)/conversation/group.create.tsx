import Header from '@/src/components/commons/header';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GroupCreate() {
	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<Header
				title={'Group Creation'}
				showSearch
				showQRScanner
				showCreateGroup
			/>
		</SafeAreaView>
	);
}
