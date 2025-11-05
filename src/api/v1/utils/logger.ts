import morgan from 'morgan';
import { Request, Response } from 'express';

morgan.token('user', (req: Request) => {
  const authReq = req as any;
  return authReq.user ? authReq.user.email : 'anonymous';
});

export const morganFormat = ':method :url :status :response-time ms - :user - :date[iso]';

export const morganSkip = (req: Request, _res: Response) => {
  return req.url === '/health';
};

export const morganMiddleware = morgan(morganFormat, {
  skip: morganSkip
});