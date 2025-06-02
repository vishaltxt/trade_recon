import express from 'express';
import multer from "multer";
import { getReconTradeData, TradeFileData } from '../../controllers/dataControlllers/tradeFile-controller.js';

export const tradeDataRouter = express.Router();
const upload = multer({ dest: "uploads/" });
tradeDataRouter.post('/tradeData', upload.single("file"), TradeFileData);
tradeDataRouter.post('/tradeDatareconcile', getReconTradeData);