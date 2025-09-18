// Api response definition for the public API, inspired by JSend specification: https://github.com/omniti-labs/jsend

import { z } from 'zod';

export type ApiResponse<T extends object> =
  | SuccessResponsePayload<T>
  | FailResponsePayload
  | ErrorResponsePayload;

export const successResponseSchema = <DataSchema extends z.ZodType>(zodObject: DataSchema) =>
  z.object({
    status: z.literal('success'),
    data: zodObject,
  });

export const failResponseSchema = z.object({
  status: z.literal('fail'),
  data: z.record(z.string()),
});

export const errorResponseSchema = z.object({
  status: z.literal('error'),
  message: z.string(),
});

export type SuccessResponsePayload<T extends object> = {
  status: 'success';
  data: T;
};

export type ErrorResponsePayload = z.infer<typeof errorResponseSchema>;
export type FailResponsePayload = z.infer<typeof failResponseSchema>;
