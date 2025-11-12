import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { validateConfig } from '../utils/helpers';

// Validate configuration and get service account file path
const serviceAccountPath = validateConfig();

// Read service account JSON file and initialize Firebase Admin SDK
if (!admin.apps.length) {
	try {
		const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			projectId: serviceAccount.project_id,
		});

		const fileName = path.basename(serviceAccountPath);
		console.log(chalk.green('✅ Firebase Admin initialized successfully'));
		console.log(chalk.blue(`📁 Service account: ${fileName}`));
		console.log(chalk.blue(`📁 Project Id: ${serviceAccount.project_id}`));
	} catch (error: any) {
		console.error(chalk.red('\n❌ Error: Firebase Admin initialization failed'));
		console.error(chalk.yellow(`   ${error.message}\n`));
		process.exit(1);
	}
}

// Export Firebase Admin services
export const auth = getAuth();
export const db = getFirestore();

// Test connection function
export const testFirebaseConnection = async (): Promise<boolean> => {
	const tests = [
		{
			name: 'Firestore Connection',
			test: async () => {
				const result = await db.collection('_test_').limit(1).get();
				return {
					success: true,
					data: `Collections accessible: ${result.size >= 0 ? 'Yes' : 'No'}`,
				};
			},
		},
		{
			name: 'Firebase Auth - List Users',
			test: async () => {
				const result = await auth.listUsers(1);
				return {
					success: true,
					data: `Total users found: ${result.users.length}`,
				};
			},
		},
		{
			name: 'Firebase Auth - Project Config',
			test: async () => {
				const app = admin.app();
				return {
					success: true,
					data: `Project: ${app.options.projectId}, Credential Type: ${app.options.credential ? 'Service Account' : 'None'}`,
				};
			},
		},
	];

	let allPassed = true;

	for (const testCase of tests) {
		try {
			const result = await testCase.test();
			console.log(chalk.green(`✅ ${testCase.name}: ${result.data}`));
		} catch (error: any) {
			console.error(chalk.red(`❌ ${testCase.name}: ${error.message}`));

			// Specific error analysis
			if (error.code?.includes('auth/')) {
				console.error(chalk.yellow(`   Error Code: ${error.code}`));
			}

			allPassed = false;
		}
	}

	return allPassed;
};
