import express from 'express';
import { getReconTradeData, TradeFileData } from '../../controllers/dataControlllers/tradeFile-controller.js';

export const tradeDataRouter = express.Router();

tradeDataRouter.post('/tradeData', TradeFileData);
tradeDataRouter.post('/tradeDatareconcile', getReconTradeData);