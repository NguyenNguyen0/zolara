import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

/**
 * Validate configuration files and return service account file path
 * Checks for .env file and Firebase service account JSON file
 */
export const validateConfig = (): string => {
	const rootDir = path.resolve(__dirname, '../../..');
	const envPath = path.join(rootDir, '.env');
	const envDir = path.join(rootDir, 'env');

	// Check .env file
	if (!fs.existsSync(envPath)) {
		console.error(chalk.red('❌ Error: .env file not found'));
		console.error(chalk.gray(`Location: ${envPath}`));
		process.exit(1);
	}

	// Check env directory
	if (!fs.existsSync(envDir)) {
		console.error(chalk.red('❌ Error: env directory not found'));
		console.error(chalk.gray(`Location: ${envDir}`));
		process.exit(1);
	}

	// Get service account file from environment variable or auto-detect
	const serviceAccountFileName = process.env.FIREBASE_SERVICE_ACCOUNT;
	let serviceAccountPath: string | null = null;

	if (serviceAccountFileName) {
		// Use file name from environment variable
		serviceAccountPath = path.join(envDir, serviceAccountFileName);
		if (!fs.existsSync(serviceAccountPath)) {
			console.error(chalk.red('❌ Error: Firebase service account file not found'));
			console.error(chalk.gray(`File: ${serviceAccountFileName}`));
			console.error(chalk.gray(`Location: ${serviceAccountPath}`));
			process.exit(1);
		}
	} else {
		// Auto-detect: find first .json file in env directory
		const files = fs.readdirSync(envDir);
		const jsonFiles = files.filter((file) => file.endsWith('.json'));

		if (jsonFiles.length === 0) {
			console.error(chalk.red('❌ Error: No JSON file found in env directory'));
			console.error(chalk.gray(`Location: ${envDir}`));
			process.exit(1);
		}

		if (jsonFiles.length > 1) {
			console.error(chalk.red('❌ Error: Multiple JSON files found in env directory'));
			console.error(chalk.gray(`Files: ${jsonFiles.join(', ')}`));
			console.error(chalk.gray(`Location: ${envDir}`));
			console.error(chalk.yellow('💡 Tip: Set FIREBASE_SERVICE_ACCOUNT environment variable to specify which file to use'));
			process.exit(1);
		}

		serviceAccountPath = path.join(envDir, jsonFiles[0]);
	}

	return serviceAccountPath;
};

