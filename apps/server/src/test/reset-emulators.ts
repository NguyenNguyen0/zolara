import { cleanupEmulators } from './utils/cleanup-emulator';

async function main() {
	try {
		await cleanupEmulators();
		process.exit(0);
	} catch (error) {
		console.error('Failed to clean up emulators:', error);
		process.exit(1);
	}
}

main();
