import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { logger } from 'firebase-functions';

export type RedisRateLimitOptions = {
  logger: typeof logger;
  prefix: string;
  redis?: {
    url: string;
    token: string;
  };
  analytics?: boolean;
  limit: number;
  windowSeconds?: number;
  identifier?: string;
};

export const redisAxiosRateLimiter = (
  axiosInstance: AxiosInstance,
  options: RedisRateLimitOptions
): AxiosInstance => {
  const rateLimit = new Ratelimit({
    redis: new Redis({
      url: options.redis?.url || process.env.UPSTASH_REDIS_REST_URL || '',
      token: options.redis?.token || process.env.UPSTASH_REDIS_REST_TOKEN || '',
    }),
    limiter: Ratelimit.slidingWindow(options.limit, `${options.windowSeconds || 1} s`),
    analytics: options.analytics ?? false,
    prefix: options.prefix,
  });

  const rateLimitMiddleware = async (config: AxiosRequestConfig) => {
    const identifier = options.identifier || config.url;

    if (!identifier) {
      return config;
    }

    if (!rateLimit) {
      return config;
    }

    const { success, limit, reset, remaining } = await rateLimit.blockUntilReady(
      identifier,
      30_000
    );

    options.logger.debug(`Rate limit for ${identifier}: ${remaining}/${limit} (reset in ${reset})`);

    if (!success) {
      // If rate limit is exceeded, throw an error
      const error = new Error('Rate limit exceeded. Unable to process, even after 30 seconds');
      // @ts-expect-error
      error.response = {
        status: 429,
        data: { limit, reset, remaining },
      };
      throw error;
    }

    return config;
  };

  const rateLimitedAxiosInstance = axiosInstance;
  rateLimitedAxiosInstance.interceptors.request.use(rateLimitMiddleware);

  return rateLimitedAxiosInstance;
};
