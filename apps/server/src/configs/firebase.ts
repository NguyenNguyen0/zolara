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
			projectId: serviceAccount.project_id || 'zolara-1e46e',
		});
		
		const fileName = path.basename(serviceAccountPath);
		console.log(chalk.green('✅ Firebase Admin initialized successfully'));
		console.log(chalk.blue(`📁 Service account: ${fileName}`));
	} catch (error: any) {
		console.error(chalk.red('\n❌ Error: Firebase Admin initialization failed'));
		console.error(chalk.yellow(`   ${error.message}\n`));
		process.exit(1);
	}
}

// Export Firebase Admin services
export const auth = getAuth();
export const db = getFirestore();
