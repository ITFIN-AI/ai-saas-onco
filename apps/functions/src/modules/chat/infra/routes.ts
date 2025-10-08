import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { DEFAULT_FIREBASE_REGION } from '@akademiasaas/shared';
import { sendMessageController } from '../useCases/sendMessage/SendMessageController';
import { getChatHistoryController } from '../useCases/getChatHistory/GetChatHistoryController';
import { getChatHistoryFromPostgresController } from '../useCases/getChatHistoryFromPostgres/GetChatHistoryFromPostgresController';

// Create Express app for chat endpoints
const app = express();

// Configure CORS
app.use(cors({ origin: true }));

// Configure body parser
app.use(bodyParser.json());

// Chat routes
app.post('/sendMessage', sendMessageController);
app.get('/getChatHistory/:sessionId', getChatHistoryController);
app.get('/getChatHistoryFromPostgres', getChatHistoryFromPostgresController);

// Export as Firebase Function
export const chat = functions.region(DEFAULT_FIREBASE_REGION).https.onRequest(app);
