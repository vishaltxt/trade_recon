// import mongoose from "mongoose";
// import fs from "fs";
// import { TradeFile } from "../modals/tradeData/dataModel.js";

// await mongoose.connect("mongodb://localhost:27017/trade_recon");

// async function seedTrades(filename) {
//   const data = fs.readFileSync(filename, "utf8");
//   const lines = data.trim().split("\n");

//   const trades = lines.map((line) => {
//     const fields = line.split(",");
//     return {
//       tradeId: Number(fields[0]),
//       productType: fields[2],
//       symbol: fields[3].trim(),
//       expiryDate: new Date(fields[4].trim()),
//       strikePrice: Number(fields[5]),
//       optionType: fields[6],
//       underlying: fields[7].trim(),
//       lots: Number(fields[13]),
//       quantity: Number(fields[14]),
//       price: parseFloat(fields[15]),
//       status: fields[20].trim(),
//       cover: fields[21].trim(),
//       timestamp: new Date(fields[22].trim()),
//       tradeNumber: fields[24].trim(),
//       brokerCode: fields[25].trim(),
//     };
//   });

//   await TradeFile.insertMany(trades);
//   console.log("Trades seeded:", trades.length);
//   mongoose.connection.close();
// }

// seedTrades("TradeFo_09052025.txt");

import mongoose from "mongoose";
import fs from "fs";
import { TradeFile } from "../modals/tradeData/dataModel.js";

async function seedTrades(filename) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const data = fs.readFileSync(filename, "utf8");
    console.log(data)
    const lines = data.trim().split("\n").slice(0); // No header assumed
                
    const trades = lines
      .map((line, index) => {
        const fields = line.split(",").map((f) => f.trim());
        if (fields.length < 29) {
          console.warn(
            `Skipping line ${index + 1} (only ${fields.length} fields):`,
            line
          );
          return null;
        }

        try {
          return {
            id: Number(fields[0]),
            segment: Number(fields[1]),
            instrument: fields[2],
            symbol: fields[3],
            expiry: fields[4],
            strike_price: parseFloat(fields[5]),
            option_type: fields[6],
            contract: fields[7],
            multiplier: Number(fields[8]),
            product_type: fields[9],
            lot_size: Number(fields[10]),
            client_code: Number(fields[11]),
            field_1: Number(fields[12]),
            field_2: Number(fields[13]),
            price: parseFloat(fields[14]),
            quantity: Number(fields[15]),
            field_3: Number(fields[16]),
            order_no: Number(fields[17]),
            trade_no: Number(fields[18]),
            status: Number(fields[19]),
            cover: Number(fields[20]),
            order_time: fields[21],
            trade_time: fields[22],
            exchange_order_id: Number(fields[23]),
            ref_no: Number(fields[24]),
            entry_time: fields[25],
            branch_code: Number(fields[26]),
          };
        } catch (err) {                   
          console.warn(`Error parsing line ${index + 1}:`, err.message);
          return null;    
        }
      })
      .filter((t) => t !== null);

    if (trades.length === 0) {
      console.log("No valid trades to insert.");
    } else {
      console.log("Sample parsed trade:", trades[0]);

      const result = await TradeFile.insertMany(trades);
      console.log(`Trades seeded: ${result.length}`);
    }
  } catch (error) {
    console.error("Error seeding trades:", error);
  } finally {
    await mongoose.connection.close();
  }
}

seedTrades("TradeFo_13052025.txt");

// import mongoose from "mongoose";
// import fs from "fs";
// import { TradeFile } from "../modals/tradeData/dataModel.js";

// function cleanField(field) {
//   return field?.trim() ?? "";
// }

// function parseNumber(field, fallback = null) {
//   const num = Number(cleanField(field));
//   return isNaN(num) ? fallback : num;
// }

// async function seedTrades(filename) {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ Connected to MongoDB");

//     const data = fs.readFileSync(filename, "utf8");
//     const lines = data.trim().split("\n");

//     const trades = [];

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];
//       const fields = line.split(",").map(cleanField);

//       if (fields.length < 27) {
//         console.warn(`⚠️ Skipping line ${i + 1}: not enough fields (${fields.length})`);
//         continue;
//       }

//       try {
//         const trade = {
//           id: parseNumber(fields[0]),
//           segment: parseNumber(fields[1]),
//           instrument: fields[2],
//           symbol: fields[3],
//           expiry: fields[4],
//           strike_price: parseNumber(fields[5]),
//           option_type: fields[6],
//           contract: fields[7],
//           multiplier: parseNumber(fields[8]),
//           product_type: fields[9],
//           lot_size: parseNumber(fields[10]),
//           client_code: parseNumber(fields[11]),
//           field_1: parseNumber(fields[12]),
//           field_2: parseNumber(fields[13]),
//           price: parseFloat(fields[14]),
//           quantity: parseNumber(fields[15]),
//           field_3: parseNumber(fields[16]),
//           order_no: parseNumber(fields[17]),
//           trade_no: parseNumber(fields[18]),
//           status: parseNumber(fields[19]),
//           cover: parseNumber(fields[20]),
//           order_time: fields[21],
//           trade_time: fields[22],
//           exchange_order_id: parseNumber(fields[23]),
//           ref_no: parseNumber(fields[24]),
//           entry_time: fields[25],
//           branch_code: parseNumber(fields[26])
//         };

//         // Ensure all required fields are present and valid
//         if (Object.values(trade).some((v) => v === null || v === "" || Number.isNaN(v))) {
//           console.warn(`⚠️ Invalid trade at line ${i + 1}, skipping.`);
//           continue;
//         }

//         trades.push(trade);
//       } catch (err) {
//         console.error(`❌ Error parsing line ${i + 1}:`, err.message);
//       }
//     }

//     if (trades.length > 0) {
//       await TradeFile.insertMany(trades);
//       console.log(`✅ Successfully seeded ${trades.length} trades`);
//     } else {
//       console.log("⚠️ No valid trades found to insert");
//     }
//   } catch (err) {
//     console.error("❌ Error during DB seeding:", err.message);
//   } finally {
//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB");
//   }
// }

// seedTrades("TradeFo_09052025.txt");
