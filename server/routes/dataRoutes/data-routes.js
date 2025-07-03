import express from "express";
import multer from "multer";
import {
  getReconTradeData,
  TradeFileData,
} from "../../controllers/dataControlllers/tradeFile-controller.js";
// import { placeOrder } from "../../services/example/interactiveTestApi.js";

export const tradeDataRouter = express.Router();
const upload = multer({ dest: "uploads/" });
tradeDataRouter.post("/tradeData", upload.single("file"), TradeFileData);
tradeDataRouter.post("/tradeDatareconcile", getReconTradeData);
// tradeDataRouter.post("/place_order", placeOrder);
