// Color constants to match mobile app
export const APP_COLOR = {
	PRIMARY: '#2563eb', // BLUE - matches mobile app
	SECONDARY: '',
	TRANSPARENT: 'transparent',
	// Theme Light
	LIGHT_MODE: '#ffffff',
	// Theme Dark
	DARK_MODE: '#1f2937',

	GRAY_200: '#e5e7eb',
	GRAY_700: '#374151',
};

// Additional UI colors for admin dashboard
export const UI_COLORS = {
	// Success/positive actions
	SUCCESS: '#10b981',
	// Warning/caution
	WARNING: '#f59e0b',
	// Error/destructive actions
	ERROR: '#ef4444',
	// Info/neutral
	INFO: '#2563eb',
	// Purple accent
	PURPLE: '#8b5cf6',

	// Chart colors
	CHART: {
		PRIMARY: '#2563eb',
		SUCCESS: '#10b981',
		WARNING: '#f59e0b',
		PURPLE: '#8b5cf6',
		ERROR: '#ef4444',
	},

	// Background variations
	BACKGROUND: {
		LIGHT: '#ffffff',
		MUTED: '#f8fafc',
		CARD: '#ffffff',
		DARK: '#1f2937',
		DARK_CARD: '#374151',
		DARK_MUTED: '#4b5563',
	},

	// Text colors
	TEXT: {
		PRIMARY: '#1f2937',
		SECONDARY: '#64748b',
		MUTED: '#9ca3af',
		LIGHT: '#ffffff',
	},

	// Border colors
	BORDER: {
		LIGHT: '#e2e8f0',
		DARK: '#4b5563',
	},
} as const;

// Export individual colors for easy access
export const COLORS = {
	...APP_COLOR,
	...UI_COLORS,
} as const;
