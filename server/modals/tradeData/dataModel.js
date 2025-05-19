import mongoose from "mongoose";
import dayjs from "dayjs";

const tradeFileSchema = new mongoose.Schema({
  symbol: String,
  expiry: String,
  strike_price: Number,
  contract_Name: String,
  buy_sell: Number,
  quantity: Number,
  master_id: Number,
  createdAt: {
      type: String,
      default: () => dayjs().format("YYYY-MM-DD HH:mm:ss"),
    },
    updatedAt: {
      type: String,
      default: () => dayjs().format("YYYY-MM-DD HH:mm:ss"),
    },
});

export const TradeFile = mongoose.model("TradeFile", tradeFileSchema);


// {
  //   id:{ type: Number, required: true },
  //   segment:{ type: Number, required: true },
  //   instrument:{ type: String, required: true },
  //   symbol:{ type: String, required: true },
  //   expiry:{ type: String, required: true },
  //   strike_price:{ type: Number, required: true },
  //   option_type:{ type: String, required: true },
  //   contract:{ type: String, required: true },
  //   multiplier:{ type: Number, required: true },
  //   product_type:{ type: String, required: true },
  //   lot_size:{ type: Number, required: true },
  //   client_code:{ type: Number, required: true },
  //   field_1:{ type: Number, required: true },
  //   field_2:{ type: Number, required: true },
  //   price:{ type: Number, required: true },
  //   quantity:{ type: Number, required: true },
  //   field_3:{ type: Number, required: true },
  //   order_no:{ type: Number, required: true },
  //   trade_no:{ type: Number, required: true },
  //   status:{ type: Number, required: true },
  //   cover:{ type: Number, required: true },
  //   order_time:{ type: String, required: true },
  //   trade_time:{ type: String, required: true },
  //   exchange_order_id:{ type: Number, required: true },
  //   ref_no:{ type: Number, required: true },
  //   entry_time:{ type: String, required: true },
  //   branch_code:{ type: Number, required: true },
  // },
  // {
  //   timestamps: true, // Adds createdAt and updatedAt
  // }