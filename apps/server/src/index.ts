import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './middlewares/logger.middleware';
import chalk from 'chalk';
import { specs } from './configs/swagger.config';
import { userRouter } from './routes/user';
import { messageRouter } from './routes/message';
import { chatRouter } from './routes/chat';
import { friendRouter } from './routes/friend';
import { agoraRouter } from './routes/agora';

dotenv.config();

const app = express();

// Middleware
// app.use(cors());
app.use(express.json());
app.use(
	logger({
		logHeader: true,
		logBody: process.env.NODE_ENV === 'development',
	}),
);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: API status check
 *     description: Check if the API is running
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 version:
 *                   type: string
 */
app.get('/', (req, res) => {
	res.json({
		status: 'API is running',
		version: '1.0.0',
	});
});

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use('/api/agora', agoraRouter);
app.use('/api/users', userRouter);
app.use('/api/chats', chatRouter);
app.use('/api/messages', messageRouter);
app.use('/api/friends', friendRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(
		`🌐 ${chalk.bold('SERVER RUNNING ON')} ${chalk.green('http://localhost:' + PORT)}`,
	);
	console.log(
		`📚 ${chalk.bold('API DOCUMENTATION')} ${chalk.yellow('http://localhost:' + PORT + '/api-docs')}`,
	);
});
