import { Request, Response, NextFunction } from 'express';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

interface RateLimitOptions {
  id: (req: Request) => string;
  windowMs: number; // refill window
  max: number; // tokens per window
}

export function rateLimit(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.id(req);
    const now = Date.now();
    const bucket = buckets.get(key) || { tokens: options.max, lastRefill: now };

    // Refill
    const elapsed = now - bucket.lastRefill;
    if (elapsed >= options.windowMs) {
      bucket.tokens = options.max;
      bucket.lastRefill = now;
    }

    if (bucket.tokens <= 0) {
      const retryAfter = Math.ceil((bucket.lastRefill + options.windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    bucket.tokens -= 1;
    buckets.set(key, bucket);
    next();
  };
}

// Convenience limiter: per user or IP
export const defaultLimiter = rateLimit({
  id: (req) => (req.session?.userId ? `u:${req.session.userId}` : `ip:${req.ip}`),
  windowMs: 60_000,
  max: 60, // 60 requests per minute
});
