import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';

/**
 * Configurable logger middleware
 * @param config Configuration object for the logger
 * @returns Express middleware function
 */
export const logger = (
	config: { logHeader: boolean, logBody: boolean } = {
		logHeader: true, logBody: false,
	},
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		// Log request headers if enabled
		if (config.logHeader && req.headers) {
			console.log(chalk.yellow.bold('\n🔍 Request Headers:'));
			console.log(chalk.yellow(JSON.stringify(req.headers, null, 2)));
		}

		// Log request body if enabled
		if (config.logBody && req.body && Object.keys(req.body).length > 0) {
			console.log(chalk.cyan.bold('\n📋 Request Body:'));
			console.log(chalk.cyan(JSON.stringify(req.body, null, 2)));
		}

		// Log basic request info
		const date = new Date();
		const timestamp = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		console.log(chalk.blue.bold(`\n📥 ${req.method} ${req.url}`));
		console.log(chalk.gray(`Timestamp: ${timestamp}`));
		console.log(chalk.gray(`IP: ${req.ip || req.socket.remoteAddress || '-'}`));

		// Capture and log response
		const originalSend = res.send;
		res.send = function (body: any) {
			// Log response status
			console.log(chalk.blue.bold(`\n📤 Response Status: ${res.statusCode}`));

			// Log response body for JSON responses if enabled
			const contentType = res.getHeader('content-type');
			if (
				config.logBody &&
				contentType &&
				typeof body === 'string' &&
				contentType.toString().includes('application/json')
			) {
				console.log(chalk.magenta.bold('📬 Response Body:'));
				try {
					const parsedBody = JSON.parse(body);
					console.log(chalk.magenta(JSON.stringify(parsedBody, null, 2)));
				} catch (e) {
					console.log(chalk.magenta(body));
				}
			}

			// Add separator
			console.log(chalk.gray('\n----------------------------------------\n'));

			return originalSend.call(this as any, body);
		};

		next();
	};
};
