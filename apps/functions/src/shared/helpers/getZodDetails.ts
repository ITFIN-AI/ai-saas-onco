import { ZodError } from 'zod';

export const getZodDetails: (error: ZodError) => { [key: string]: string } = (error) => {
  return error.errors.reduce((acc, curr) => {
    const key = curr.path.join('.').replace(/(params|query|body)\./, '');

    return { ...acc, [key]: curr.message };
  }, {});
};
