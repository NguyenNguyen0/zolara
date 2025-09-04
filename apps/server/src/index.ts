import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { loggerMiddleware } from './middlewares/logger';
import { User, UserSchema } from '@repo/types';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware)

// Basic route
app.get('/', (req, res) => {
  const user: User = UserSchema.parse({id: "1", name: "nguyen", email: "n@gmail.com"});
  res.send(`Zolara Chat API is running: ${JSON.stringify(user)}`);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `🌐 ${chalk.bold("SERVER RUNNING ON")} ${chalk.green("http://localhost:" + PORT)}`
  );
});
