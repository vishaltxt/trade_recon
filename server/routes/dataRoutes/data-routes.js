import express from 'express';
import { TradeFileData } from '../../controllers/dataControlllers/tradeFile-controller.js';

export const tradeDataRouter = express.Router();

tradeDataRouter.post('/tradeData', TradeFileData);