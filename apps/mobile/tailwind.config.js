import { APP_COLOR } from './src/utils/constants';

/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all files that contain Nativewind classes.
	content: [
		'./app/**/*.{js,jsx,ts,tsx}',
		'./src/components/**/*.{js,jsx,ts,tsx}',
	],
	presets: [require('nativewind/preset')],
	darkMode: 'class', // Enable class-based dark mode
	theme: {
		extend: {
			colors: {
				primary: APP_COLOR.PRIMARY,
				"secondary-light": APP_COLOR.GRAY_200,
				"secondary-dark": APP_COLOR.GRAY_700,
				"light-mode": APP_COLOR.LIGHT_MODE,
				"dark-mode": APP_COLOR.DARK_MODE,
			},
		},
	},
	plugins: [],
};
