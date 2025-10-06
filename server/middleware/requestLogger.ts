import type { Request, Response, NextFunction } from 'express';

export function requestLogger() {
  return function(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime.bigint();
    const { method, originalUrl } = req;
    res.on('finish', () => {
      const durMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      // Basic structured line
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ lvl: 'info', msg: 'req', method, url: originalUrl, status: res.statusCode, durMs: +durMs.toFixed(2) }));
    });
    next();
  };
}
