import type { Request } from 'express';
export const getClientIp = (req: Request) => (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
export const getReqUser = (req: Request) => (req.headers['x-user-name'] as string) || 'admin';
