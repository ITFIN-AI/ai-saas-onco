/* eslint-disable @typescript-eslint/no-require-imports */

export { eventsFanOut } from './modules/eventsFanOut';

export const invoices = require('./modules/invoices/infra/routes');
export const users = require('./modules/users/infra/routes');
export const system = require('./modules/system/infra/routes');
export const subscriptions = require('./modules/subscriptions/infra/routes');
export const admin = require('./modules/admin/infra/routes');
export const chat = require('./modules/chat/infra/routes').chat;
export const api = require('./modules/api/infra/routes').default;
