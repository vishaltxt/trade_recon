// import { TradeFile } from "../../modals/tradeData/dataModel.js";

// export const TradeFileData = async (req, res) => {
//   try {
//     const trades = await TradeFile.find().limit(100); // Add filters if required
//     res.status(200).json(trades);
//   } catch (error) {
//     console.error("Error fetching trades:", error); // Better logging
//     res.status(500).json({ message: "Unable to fetch data", error: error.message });
//   }
// };
// controllers/tradeController.js
import fs from "fs";
import path from "path";
import { TradeFile } from "../../modals/tradeData/dataModel.js";

const formatDate = (date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}${mm}${yyyy}`;
};

const findLatestAvailableFile = async (startDate, baseDir, maxTries = 7) => {
  for (let i = 1; i <= maxTries; i++) {
    const testDate = new Date(startDate);
    testDate.setDate(testDate.getDate() - i);
    const dateStr = formatDate(testDate);
    const filePath = path.join(baseDir, `TradeFo_${dateStr}.txt`);
    if (fs.existsSync(filePath)) return { filePath, dateStr };
  }
  return null;
};

const readFileAndParse = (filePath, dateStr, keys) => {
  return new Promise((resolve) => {
    if (!filePath) return resolve([]);
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.warn(`Warning: Could not read file ${filePath}`, err.message);
        return resolve([]);
      }
      const lines = data.trim().split("\r\n").filter(Boolean);
      const parsedData = lines.map((line) => {
        const values = line.split(",");
        const obj = {};
        keys.forEach((key, i) => {
          obj[key] = values[i] || "";
        });
        obj.fileDate = dateStr;
        return obj;
      });
      resolve(parsedData);
    });
  });
};

export const TradeFileData = async (req, res) => {
  try {
    const baseDir = process.env.FILE_PATH || "./data";
    const today = new Date();
    const todayStr = formatDate(today);
    const todayFilePath = path.join(baseDir, `TradeFo_${todayStr}.txt`);
    const previous = await findLatestAvailableFile(today, baseDir);

    const keys = [
      "id",
      "segment",
      "instrument",
      "symbol",
      "expiry",
      "strike_price",
      "option_type",
      "contract_Name",
      "multiplier",
      "product_type",
      "lot_size",
      "client_code",
      "price",
      "buy_sell",
      "quantity",
      "quantitya",
      "order_no",
      "master_id",
      "trade_no",
      "status",
      "cover",
      "order_time",
      "trade_time",
      "exchange_order_id",
      "ref_no",
      "entry_time",
      "branch_code",
    ];

    const [prevData, todayData] = await Promise.all([
      readFileAndParse(previous?.filePath, previous?.dateStr, keys),
      readFileAndParse(todayFilePath, todayStr, keys),
    ]);

    const combined = [...prevData, ...todayData];
    const validDates = [todayStr, previous?.dateStr].filter(Boolean);

    // Clean up unwanted data
    await TradeFile.deleteMany({
      $or: [
        { fileDate: { $exists: false } },
        { fileDate: { $nin: validDates } },
      ],
    });

    let insertedCount = 0;
    let insertedData = [];

    for (const dateStr of validDates) {
      const dateData = combined.filter((item) => item.fileDate === dateStr);
      const existing = await TradeFile.countDocuments({ fileDate: dateStr });

      if (existing === 0 && dateData.length > 0) {
        const transformed = dateData.map((item) => ({
          symbol: item.symbol,
          expiry: item.expiry,
          strike_price: parseFloat(item.strike_price),
          contract_Name: item.contract_Name,
          buy_sell: item.buy_sell,
          quantity: parseInt(item.quantity) || 0,
          master_id: item.master_id,
          fileDate: item.fileDate,
        }));

        const inserted = await TradeFile.insertMany(transformed);
        insertedCount += inserted.length;
        insertedData = insertedData.concat(inserted);
      }
    }

    res.json({
      inserted: insertedCount,
      keptDates: validDates,
      insertedData, // Added this
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// "id",
//       "segment",
//       "instrument",
//       "symbol",
//       "expiry",
//       "strike_price",
//       "option_type",
//       "contract",
//       "multiplier",
//       "product_type",
//       "lot_size",
//       "client_code",
//       "field_1",
//       "field_2",
//       "price",
//       "quantity",
//       "field_3",
//       "order_no",
//       "trade_no",
//       "status",
//       "cover",
//       "order_time",
//       "trade_time",
//       "exchange_order_id",
//       "ref_no",
//       "entry_time",
//       "branch_code",
