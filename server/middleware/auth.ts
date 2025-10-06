import { Request, Response, NextFunction } from "express";

export interface AuthedRequest extends Request {
  session: Request['session'] & { userId?: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export function attachUserId(optional = false) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!optional && !req.session?.userId) {
      return next();
    }
    next();
  };
}
