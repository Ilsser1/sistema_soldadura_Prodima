import { randomBytes } from 'node:crypto';
import type { Request } from 'express';
const sessions = new Map<string, { userId: number; expires: number }>();
export function createSession(userId: number) {
  for (const [key, value] of sessions) if (value.expires < Date.now()) sessions.delete(key);
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { userId, expires: Date.now() + 8 * 60 * 60 * 1000 });
  return token;
}
const tokenOf = (req: Request) => req.headers.authorization?.replace(/^Bearer /, '') || '';
export function sessionUserId(req: Request) {
  const session = sessions.get(tokenOf(req));
  return session && session.expires > Date.now() ? session.userId : undefined;
}
export function revokeSession(req: Request) { sessions.delete(tokenOf(req)); }
