import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import express from 'express';
import { isAuthorizedApiRequest } from 'shared/infra/http/middleware/apiAuthorizer';
import { ApiController } from 'shared/infra/http/ApiController';
import { logger } from 'firebase-functions';

export const rateLimiter =
  (opts: {
    logger: typeof logger;
    prefix: string;
    redis: {
      url: string;
      token: string;
    };
    analytics?: boolean;
    limit: number;
    windowSeconds: number;
  }) =>
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!isAuthorizedApiRequest(req)) {
      return ApiController.unauthorized(res);
    }

    const rateLimit = new Ratelimit({
      redis: new Redis({
        url: opts.redis.url,
        token: opts.redis.token,
      }),
      limiter: Ratelimit.fixedWindow(opts.limit, `${opts.windowSeconds} s`),
      analytics: opts.analytics ?? false,
      prefix: opts.prefix,
    });

    const identifier = req.auth.sub;
    const { success, reset, remaining } = await rateLimit.limit(identifier);

    const resetInSeconds = Math.floor((new Date(reset).getTime() - new Date().getTime()) / 1000);
    const remainingRequestsInWindow = Math.max(0, remaining);

    res.setHeader('RateLimit-Limit', opts.limit);
    res.setHeader('RateLimit-Remaining', remainingRequestsInWindow);
    res.setHeader('RateLimit-Reset', resetInSeconds);

    if (!success) {
      logger.debug(`Rate limit exceeded for ${identifier}`);

      return ApiController.tooManyRequests(res);
    }

    return next();
  };
