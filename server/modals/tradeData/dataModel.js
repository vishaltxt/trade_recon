import mongoose from "mongoose";
// import dayjs from "dayjs";

const tradeFileSchema = new mongoose.Schema({
  symbol: String,
  expiry: String,
  strike_price: Number,
  master_id: String,
  master_neet: String,
  master_twelve: String,
  option_type: String,
  quantity: Number,
  net_quantity: Number,
  // contract_Name: String,
  buy_quantity: Number,
  sell_quantity: Number,
  buy_sell: Number,
  fileDate: String,
  // createdAt: {
  //     type: String,
  //     default: () => dayjs().format("YYYY-MM-DD HH:mm:ss"),
  //   },
  //   updatedAt: {
  //     type: String,
  //     default: () => dayjs().format("YYYY-MM-DD HH:mm:ss"),
  //   },
});

export const TradeFile = mongoose.model("TradeFile", tradeFileSchema);
