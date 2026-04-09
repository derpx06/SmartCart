import type { JwtPayload } from 'jsonwebtoken';

export type AuthenticatedUser = JwtPayload & {
  userId: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
