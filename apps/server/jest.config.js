/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/test/**/*.test.ts'],
	verbose: true,
	forceExit: true,
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true,
	testTimeout: 30000,
	setupFilesAfterEnv: ['./jest.setup.js'],
	transform: {
		'^.+\\.tsx?$': ['ts-jest', {
			tsconfig: './tsconfig.test.json'
		}]
	},
	transformIgnorePatterns: [
		'node_modules/(?!@repo/.*)'
	],
	moduleNameMapper: {
		"^chalk$": "<rootDir>/src/test/mocks/chalk.js"
	}
};
