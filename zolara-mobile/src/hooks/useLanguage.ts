import { useLanguageStore } from '@/src/store/languageStore';
import { useEffect, useRef } from 'react';

export const useLanguage = () => {
	const isInitializedRef = useRef(false);

	const { language, isInitialized, setLanguage, initialize } = useLanguageStore();

	// Initialize language on mount (once)
	useEffect(() => {
		if (!isInitializedRef.current) {
			initialize();
			isInitializedRef.current = true;
		}
	}, [initialize]);

	return {
		language,
		isInitialized,
		setLanguage,
	};
};
