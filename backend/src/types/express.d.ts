import type { JwtPayload } from 'jsonwebtoken';

export type AuthenticatedUser = JwtPayload & {
  userId: string;
  isAdmin?: boolean;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
