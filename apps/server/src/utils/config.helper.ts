import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

/**
 * Validate configuration and return service account file path
 * - Checks .env file exists in root directory (REQUIRED)
 * - Checks env/ folder exists (REQUIRED)
 * - Validates Firebase service account file (REQUIRED)
 * - Returns service account file path if valid
 */
export const validateConfig = (): string => {
	const rootPath = path.join(__dirname, '../../');
	const envFilePath = path.join(rootPath, '.env');
	const envFolderPath = path.join(__dirname, '../../env');

	// 1. Check .env file in root directory (REQUIRED)
	if (!fs.existsSync(envFilePath)) {
		console.error(chalk.red('\n❌ Error: .env file not found'));
		console.error(chalk.yellow(`   Location: ${envFilePath}\n`));
		process.exit(1);
	}
	console.log(chalk.green(`✅ .env file found: ${envFilePath}`));

	// 2. Check env/ folder exists (REQUIRED)
	if (!fs.existsSync(envFolderPath)) {
		console.error(chalk.red('\n❌ Error: env/ folder not found'));
		console.error(chalk.yellow(`   Location: ${envFolderPath}\n`));
		process.exit(1);
	}

	// 3. Check Firebase service account file (REQUIRED)
	let serviceAccountFileName = process.env.FIREBASE_SERVICE_ACCOUNT;

	// If not set in environment variable, auto-detect JSON file in env/ folder
	if (!serviceAccountFileName) {
		try {
			const envFiles = fs.readdirSync(envFolderPath);
			const jsonFiles = envFiles.filter((file) => file.endsWith('.json') && !file.includes('template'));

			if (jsonFiles.length === 0) {
				console.error(chalk.red('\n❌ Error: No Firebase service account JSON file found'));
				console.error(chalk.yellow(`   Location: ${envFolderPath}\n`));
				process.exit(1);
			}

			if (jsonFiles.length > 1) {
				console.error(chalk.red('\n❌ Error: Multiple JSON files found in env/ folder'));
				console.error(chalk.yellow(`   Files: ${jsonFiles.join(', ')}\n`));
				process.exit(1);
			}

			serviceAccountFileName = jsonFiles[0];
			console.log(chalk.blue(`📁 Auto-detected service account file: ${serviceAccountFileName}`));
		} catch (error: any) {
			console.error(chalk.red('\n❌ Error: Cannot read env/ folder'));
			console.error(chalk.yellow(`   ${error.message}\n`));
			process.exit(1);
		}
	}

	// 4. Validate service account file exists
	const serviceAccountPath = path.join(envFolderPath, serviceAccountFileName);
	if (!fs.existsSync(serviceAccountPath)) {
		console.error(chalk.red('\n❌ Error: Firebase service account file not found'));
		console.error(chalk.yellow(`   File: ${serviceAccountPath}\n`));
		process.exit(1);
	}

	// 5. Validate file extension
	if (!serviceAccountFileName.endsWith('.json')) {
		console.error(chalk.red('\n❌ Error: Invalid file extension'));
		console.error(chalk.yellow(`   File: ${serviceAccountFileName}\n`));
		process.exit(1);
	}

	console.log(chalk.green(`✅ Firebase service account file found: ${serviceAccountFileName}`));

	return serviceAccountPath;
};
