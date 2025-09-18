import express from 'express';
import { ZodObject, ZodRawShape } from 'zod';

export type ApiRoute = {
  name: string;
  description?: string;
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  handler: (req: express.Request, res: express.Response) => Promise<void>;
  schema: {
    request: ZodObject<{
      body?: ZodObject<ZodRawShape>;
      params?: ZodObject<ZodRawShape>;
      query?: ZodObject<ZodRawShape>;
    }>;
    response: ZodObject<ZodRawShape>;
  };
};
