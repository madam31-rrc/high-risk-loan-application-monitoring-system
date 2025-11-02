import express, { Application, Request, Response } from 'express';
import { config } from './config/environment';
import { morganMiddleware } from './api/v1/utils/logger';
import { HTTP_STATUS } from './constants/httpStatus';
import { Messages } from './constants/messages';
import apiV1Routes from './api/v1/routes/loanRoutes';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use(`/api/${config.apiVersion}`, apiV1Routes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: Messages.SERVER_RUNNING,
    version: config.apiVersion,
    environment: config.nodeEnv
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`PiXELL-River Financial API running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`API Version: ${config.apiVersion}`);
});

export default app;