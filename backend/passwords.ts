import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string): string {
  if (!password || password.length > 1024) throw new Error('Contraseña inválida.');
  const salt = randomBytes(16).toString('hex');
  return ['scrypt', salt, scryptSync(password, salt, 64).toString('hex')].join('$');
}

export function verifyPassword(password: unknown, hash: string): boolean {
  if (typeof password !== 'string' || !password || password.length > 1024) return false;
  const [format, salt, key] = (hash || '').split('$');
  if (format !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(key || '')) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(key, 'hex'));
}

