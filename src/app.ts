import express, { Application, Request, Response } from 'express';
import apiV1Routes from './api/v1/routes';
import { morganMiddleware } from './api/v1/utils/logger';
import { config } from './config/environment';
import { HTTP_STATUS } from './constants/httpStatus';
import { Messages } from './constants/messages';
import errorHandler from './api/v1/middleware/errorHandler';
import { consoleLogger,accessLogger, errorLogger } from './api/v1/middleware/logger';
const app: Application = express();


// Logging middleware (should be applied early in the middleware stack)
if (process.env.NODE_ENV === "production") {
    // In production, log to files
    app.use(accessLogger);
    app.use(errorLogger);
} else {
    // In development, log to console for immediate feedback
    app.use(consoleLogger);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

app.get('/health', (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

app.use(`/api/${config.apiVersion}`, apiV1Routes);

app.get('/', (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: Messages.SERVER_RUNNING,
    version: config.apiVersion,
    environment: config.nodeEnv
  });
});

app.use((_req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`PiXELL-River Financial API running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`API Version: ${config.apiVersion}`);
});

app.use(errorHandler);

export default app;