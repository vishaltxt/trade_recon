// import mongoose from "mongoose";
// import fs from "fs";
// import { TradeFile } from "../modals/tradeData/dataModel.js";

// async function seedTrades(filename) {
//   try {
//     await mongoose.connect("mongodb://localhost:27017/trade_recon");
//     console.log("Connected to MongoDB");

//     const data = fs.readFileSync(filename, "utf8");
//     console.log(data)
//     const lines = data.trim().split("\n").slice(0); // No header assumed
                
//     const trades = lines
//       .map((line, index) => {
//         const fields = line.split(",").map((f) => f.trim());
//         if (fields.length < 29) {
//           console.warn(`Skipping line ${index + 1} (only ${fields.length} fields):`,line);
//           return null;
//         }

//         try {
//           return {
//             id: Number(fields[0]),
//             segment: Number(fields[1]),
//             instrument: fields[2],
//             symbol: fields[3],
//             expiry: fields[4],
//             strike_price: parseFloat(fields[5]),
//             option_type: fields[6],
//             contract: fields[7],
//             multiplier: Number(fields[8]),
//             product_type: fields[9],
//             lot_size: Number(fields[10]),
//             client_code: Number(fields[11]),
//             field_1: Number(fields[12]),
//             field_2: Number(fields[13]),
//             price: parseFloat(fields[14]),
//             quantity: Number(fields[15]),
//             field_3: Number(fields[16]),
//             order_no: Number(fields[17]),
//             trade_no: Number(fields[18]),
//             status: Number(fields[19]),
//             cover: Number(fields[20]),
//             order_time: fields[21],
//             trade_time: fields[22],
//             exchange_order_id: Number(fields[23]),
//             ref_no: Number(fields[24]),
//             entry_time: fields[25],
//             branch_code: Number(fields[26]),
//           };
//         } catch (err) {                   
//           console.warn(`Error parsing line ${index + 1}:`, err.message);
//           return null;    
//         }
//       })
//       .filter((t) => t !== null);

//     if (trades.length === 0) {
//       console.log("No valid trades to insert.");
//     } else {
//       console.log("Sample parsed trade:", trades[0]);

//       const result = await TradeFile.insertMany(trades);
//       console.log(`Trades seeded: ${result.length}`);
//     }
//   } catch (error) {
//     console.error("Error seeding trades:", error);
//   } finally {
//     await mongoose.connection.close();
//   }
// }

// seedTrades("D:/TRD/NOTIS/TradeFo_13052025.txt");
