import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import dotenv from 'dotenv';
import chalk from 'chalk';
import morgan from 'morgan';
import { specs } from './configs/swagger';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import permissionRoutes from './routes/permission';
import roleRoutes from './routes/role';
import agentRoutes from './routes/agent';
import { attachTraceId } from './middlewares/trace';
import { errorHandler } from './middlewares/error-handler';
import { seedData } from './scripts/seed.data';

dotenv.config();

// Initialize Firebase (validation and initialization happens here)
import './configs/firebase';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(attachTraceId);

app.get('/', (req, res) => {
	res.json({
		status: 'Zolara API is running',
		version: '1.0.0',
	});
});

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/agent', agentRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server and seed data
const PORT = process.env.PORT || 3000;

// Seed data
seedData()
	.then(() => {
		console.log('✅ Permissions and roles seeded successfully');
	})
	.catch((error) => {
		console.error('⚠️  Warning: Failed to seed permissions and roles:', error.message);
		console.log('Server will continue to start, but some features may not work correctly.');
	})
	.finally(() => {
		app.listen(PORT, () => {
			console.log(
				`🌐 ${chalk.bold('SERVER RUNNING ON')} ${chalk.green('http://localhost:' + PORT)}`,
			);
			console.log(
				`📚 ${chalk.bold('API DOCUMENTATION')} ${chalk.yellow('http://localhost:' + PORT + '/api-docs')}`,
			);
		});
	});
