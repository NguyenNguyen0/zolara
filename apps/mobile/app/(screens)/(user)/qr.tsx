import NavigateHeader from "@/src/components/commons/navigate.header";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QR() {
	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader
				title={"QR Scanner"}
				showSearch
				showQRScanner
				showCreateGroup
			/>
		</SafeAreaView>
	);
}
