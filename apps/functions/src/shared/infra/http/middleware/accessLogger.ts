import express from 'express';
import * as functions from 'firebase-functions';
import { IncomingHttpHeaders } from 'http';

export const requestLogger = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  functions.logger.debug(`Handling new request: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    param: req.params,
    body: req.body,
    query: req.query,
    baseUrl: req.baseUrl,
    hostname: req.hostname,
    ip: req.ip,
    headers: redactSensitiveHeaders(req.headers),
  });
  next();
};

export const redactSensitiveHeaders = (headers: IncomingHttpHeaders) => {
  const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie'];
  const safeHeaders = { ...headers };

  sensitiveHeaders.forEach((header) => {
    if (safeHeaders[header]) {
      safeHeaders[header] = '***redacted***';
    }
  });

  return safeHeaders;
};
