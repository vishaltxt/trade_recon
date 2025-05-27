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
import { MappingForm } from "../../modals/formModels/mappingFormModel.js";

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
        const cleanString = (str) =>
          typeof str === "string" ? str.trim().replace(/\s+/g, " ") : str;

        const transformed = dateData.map((item) => ({
          symbol: cleanString(item.symbol),
          expiry: cleanString(item.expiry),
          strike_price: item.strike_price,
          contract_Name: cleanString(item.contract_Name),
          buy_sell: Number(item.buy_sell),
          quantity: parseInt(item.quantity) || 0,
          master_id: Number(item.master_id),
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

// I have to get masters and the minions from the backend and then filter,add,and display the master and the minion of that code in the frontend

// export const getReconTradeData = async (req, res) => {
//   try {
//     const { masterTraderIds } = req.body;
// console.log("Received body:", req.body);

//     if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
//       return res.status(400).json({ error: "No master IDs provided" });
//     }

//     // Convert master IDs to strings for mapping lookup
//     const masterIdStrings = masterTraderIds.map(String);

//     // 1. Fetch mappings+
//     const mappings = await MappingForm.find({
//       masterId: { $in: masterIdStrings },
//     });
//     const minionIdStrings = mappings.map((m) => m.minionId);
//     console.log("Mappings found:", mappings);
//     console.log("Minion IDs:", minionIdStrings);

//     // 2. Convert master & minion IDs to numbers for trade data lookup
//     const masterIdNums = masterIdStrings.map(Number);
//     const minionIdNums = minionIdStrings.map(Number);
      
//     // 3. Fetch trade data
//     const [masterData, minionData] = await Promise.all([
//       TradeFile.find({ master_id: { $in: masterIdNums } }),
//       TradeFile.find({ master_id: { $in: minionIdNums } }),
//     ]);
//     // console.log(masterData);
          
//     res.json({
//       masterData,
//       minionData,
//     });
//   } catch (err) {
//     console.error("getReconTradeData error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };




// import { TradeFile } from "../models/tradeFile.js";
// import { MappingForm } from "../models/mappingForm.js";

// export const getReconTradeData = async (req, res) => {
//   try {
//     const { masterTraderIds } = req.body;
//     // const {minionClientCodes} = req.body;
//     console.log("Received body:", req.body);

//     if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
//       return res.status(400).json({ error: "No master IDs provided" });
//     }

//     // Convert master IDs to strings for mapping lookup
//     const masterIdStrings = masterTraderIds.map(String);

//     // 1. Fetch mappings
//     const mappings = await MappingForm.find({
//       masterId: { $in: masterIdStrings },
//     });

//     const minionIdStrings = mappings.map((m) => m.minionId);
//     console.log("Mappings found:", mappings);
//     console.log("Minion IDs:", minionIdStrings);

//     // 2. Convert to numbers
//     const masterIdNums = masterIdStrings.map(Number);
//     const minionIdNums = minionIdStrings.map(Number);

//     // 3. Aggregation pipeline function
//     const aggregateGroupedData = (ids) => [
//       {
//         $match: {
//           master_id: { $in: ids },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             contract_Name: "$contract_Name",
//             buy_sell: "$buy_sell",
//           },
//           total_quantity: { $sum: "$quantity" },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id.contract_Name",
//           quantities: {
//             $push: {
//               buy_sell: "$_id.buy_sell",
//               total_quantity: "$total_quantity",
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           contract_Name: "$_id",
//           buy: {
//             $sum: {
//               $map: {
//                 input: {
//                   $filter: {
//                     input: "$quantities",
//                     as: "item",
//                     cond: { $eq: ["$$item.buy_sell", 1] },
//                   },
//                 },
//                 as: "b",
//                 in: "$$b.total_quantity",
//               },
//             },
//           },
//           sell: {
//             $sum: {
//               $map: {
//                 input: {
//                   $filter: {
//                     input: "$quantities",
//                     as: "item",
//                     cond: { $eq: ["$$item.buy_sell", 2] },
//                   },
//                 },
//                 as: "s",
//                 in: "$$s.total_quantity",
//               },
//             },
//           },
//         },
//       },
//     ];

//     // 4. Run both aggregations in parallel
//     const [masterData, minionData] = await Promise.all([
//       TradeFile.aggregate(aggregateGroupedData(masterIdNums)),
//       TradeFile.aggregate(aggregateGroupedData(minionIdNums)),
//     ]);

//     // 5. Return response
//     res.json({
//       masterData,
//       minionData,
//     });
//   } catch (err) {
//     console.error("getReconTradeData error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };




// BUY / SELL logic
// export const getReconTradeData = async (req, res) => {
//   try {
//     const { masterTraderIds } = req.body;
//     console.log("Received body:", req.body);

//     if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
//       return res.status(400).json({ error: "No master IDs provided" });
//     }

//     const masterIdStrings = masterTraderIds.map(String);

//     // 1. Fetch mappings
//     const mappings = await MappingForm.find({
//       masterId: { $in: masterIdStrings },
//     });

//     const minionIdStrings = mappings.map((m) => m.minionId);
//     console.log("Mappings found:", mappings);
//     console.log("Minion IDs:", minionIdStrings);

//     // Convert to numbers
//     const masterIdNums = masterIdStrings.map(Number);
//     const minionIdNums = minionIdStrings.map(Number);

//     // Aggregation pipeline with filtering out zero difference
//     const aggregateWithDifference = (ids) => [
//       {
//         $match: {
//           master_id: { $in: ids },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             contract_Name: "$contract_Name",
//             buy_sell: "$buy_sell",
//           },
//           total_quantity: { $sum: "$quantity" },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id.contract_Name",
//           quantities: {
//             $push: {
//               buy_sell: "$_id.buy_sell",
//               total_quantity: "$total_quantity",
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           contract_Name: "$_id",
//           buy: {
//             $sum: {
//               $map: {
//                 input: {
//                   $filter: {
//                     input: "$quantities",
//                     as: "item",
//                     cond: { $eq: ["$$item.buy_sell", 1] },
//                   },
//                 },
//                 as: "b",
//                 in: "$$b.total_quantity",
//               },
//             },
//           },
//           sell: {
//             $sum: {
//               $map: {
//                 input: {
//                   $filter: {
//                     input: "$quantities",
//                     as: "item",
//                     cond: { $eq: ["$$item.buy_sell", 2] },
//                   },
//                 },
//                 as: "s",
//                 in: "$$s.total_quantity",
//               },
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           contract_Name: 1,
//           total_quantity: { $subtract: ["$buy", "$sell"] },
//           actionType: {
//             $cond: [
//               { $gt: [{ $subtract: ["$buy", "$sell"] }, 0] },
//               "sell",
//               "buy",
//             ],
//           },
//         },
//       },
//       {
//         $match: {
//           total_quantity: { $ne: 0 }, // Filter out neutral values
//         },
//       },
//     ];

//     // Execute both aggregations in parallel
//     const [masterData, minionData] = await Promise.all([
//       TradeFile.aggregate(aggregateWithDifference(masterIdNums)),
//       TradeFile.aggregate(aggregateWithDifference(minionIdNums)),
//     ]);

//     // Respond with filtered and computed data
//     res.json({
//       masterData,
//       minionData,
//     });
//   } catch (err) {
//     console.error("getReconTradeData error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };




// With Difference of the masters and minions

// export const getReconTradeData = async (req, res) => {
//   try {
//     const { masterTraderIds } = req.body;
//     // const {minionClientCodes} = req.body
//         console.log("Received body:", req.body);


//     if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
//       return res.status(400).json({ error: "No master IDs provided" });
//     }

//     const masterIdStrings = masterTraderIds.map(String);

//     const mappings = await MappingForm.find({
//       masterId: { $in: masterIdStrings },
//     });

//     const minionIdStrings = mappings.map((m) => m.minionId);
//     console.log("Mappings found:", mappings);
//     console.log("Minion IDs:", minionIdStrings);

//     const masterIdNums = masterIdStrings.map(Number);
//     const minionIdNums = minionIdStrings.map(Number);

//     const aggregateGroupedData = (ids) => [
//       {
//         $match: { master_id: { $in: ids } },
//       },
//       {
//         $group: {
//           _id: {
//             contract_Name: "$contract_Name",
//             buy_sell: "$buy_sell",
//           },
//           total_quantity: { $sum: "$quantity" },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id.contract_Name",
//           quantities: {
//             $push: {
//               buy_sell: "$_id.buy_sell",
//               total_quantity: "$total_quantity",
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           contract_Name: "$_id",
//           total_quantity: {
//             $subtract: [
//               {
//                 $sum: {
//                   $map: {
//                     input: {
//                       $filter: {
//                         input: "$quantities",
//                         as: "item",
//                         cond: { $eq: ["$$item.buy_sell", 1] },
//                       },
//                     },
//                     as: "b",
//                     in: "$$b.total_quantity",
//                   },
//                 },
//               },
//               {
//                 $sum: {
//                   $map: {
//                     input: {
//                       $filter: {
//                         input: "$quantities",
//                         as: "item",
//                         cond: { $eq: ["$$item.buy_sell", 2] },
//                       },
//                     },
//                     as: "s",
//                     in: "$$s.total_quantity",
//                   },
//                 },
//               },
//             ],
//           },
//         },
//       },
//       {
//         $match: { total_quantity: { $ne: 0 } },
//       },
//       {
//         $addFields: {
//           actionType: {
//             $cond: [{ $gt: ["$total_quantity", 0] }, "buy", "sell"],
//           },
//         },
//       },
//     ];

//     const [masterData, minionData] = await Promise.all([
//       TradeFile.aggregate(aggregateGroupedData(masterIdNums)),
//       TradeFile.aggregate(aggregateGroupedData(minionIdNums)),
//     ]);

//     // Map both sides for quick lookups
//     const masterMap = Object.fromEntries(
//       masterData.map((m) => [m.contract_Name, m.total_quantity])
//     );
//     const minionMap = Object.fromEntries(
//       minionData.map((m) => [m.contract_Name, m.total_quantity])
//     );

//     // Enrich each minion record with corresponding master_quantity
//     const enrichedMinionData = minionData.map((m) => ({
//       ...m,
//       master_quantity: masterMap[m.contract_Name] || 0,
//     }));

//     // Enrich each master record with corresponding minion_quantity
//     const enrichedMasterData = masterData.map((m) => ({
//       ...m,
//       minion_quantity: minionMap[m.contract_Name] || 0,
//     }));

//     res.json({
//       masterData: enrichedMasterData,
//       minionData: enrichedMinionData,
//     });
//   } catch (err) {
//     console.error("getReconTradeData error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };



// with  master_id updation
export const getReconTradeData = async (req, res) => {
  try {
    const { masterTraderIds } = req.body;
    console.log("Received body:", req.body);

    if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
      return res.status(400).json({ error: "No master IDs provided" });
    }

    const masterIdStrings = masterTraderIds.map(String);

    const mappings = await MappingForm.find({
      masterId: { $in: masterIdStrings },
    });

    const minionIdStrings = mappings.map((m) => m.minionId);
    console.log("Mappings found:", mappings);
    console.log("Minion IDs:", minionIdStrings);

    const masterIdNums = masterIdStrings.map(Number);
    const minionIdNums = minionIdStrings.map(Number);

    const aggregateGroupedData = (ids, includeMasterId = false) => {
      const pipeline = [
        {
          $match: { master_id: { $in: ids } },
        },
        ...(includeMasterId
          ? [
              {
                $addFields: { group_master_id: "$master_id" }, // temporary field for grouping
              },
            ]
          : []),
        {
          $group: {
            _id: {
              contract_Name: "$contract_Name",
              buy_sell: "$buy_sell",
              ...(includeMasterId ? { master_id: "$group_master_id" } : {}),
            },
            total_quantity: { $sum: "$quantity" },
          },
        },
        {
          $group: {
            _id: {
              contract_Name: "$_id.contract_Name",
              ...(includeMasterId ? { master_id: "$_id.master_id" } : {}),
            },
            quantities: {
              $push: {
                buy_sell: "$_id.buy_sell",
                total_quantity: "$total_quantity",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            contract_Name: "$_id.contract_Name",
            ...(includeMasterId ? { master_id: "$_id.master_id" } : {}),
            total_quantity: {
              $subtract: [
                {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$quantities",
                          as: "item",
                          cond: { $eq: ["$$item.buy_sell", 1] },
                        },
                      },
                      as: "b",
                      in: "$$b.total_quantity",
                    },
                  },
                },
                {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$quantities",
                          as: "item",
                          cond: { $eq: ["$$item.buy_sell", 2] },
                        },
                      },
                      as: "s",
                      in: "$$s.total_quantity",
                    },
                  },
                },
              ],
            },
          },
        },
        {
          $match: { total_quantity: { $ne: 0 } },
        },
        {
          $addFields: {
            actionType: {
              $cond: [{ $gt: ["$total_quantity", 0] }, "buy", "sell"],
            },
          },
        },
      ];

      return pipeline;
    };

    const [masterData, minionData] = await Promise.all([
      TradeFile.aggregate(aggregateGroupedData(masterIdNums, true)),  // Include master_id
      TradeFile.aggregate(aggregateGroupedData(minionIdNums, true)), // Minion doesn't need master_id
    ]);

    const masterMap = Object.fromEntries(
      masterData.map((m) => [m.contract_Name, m.total_quantity])
    );
    const minionMap = Object.fromEntries(
      minionData.map((m) => [m.contract_Name, m.total_quantity])
    );

    const enrichedMinionData = minionData.map((m) => ({
      ...m,
      master_quantity: masterMap[m.contract_Name] || 0,
    }));

    const enrichedMasterData = masterData.map((m) => ({
      ...m,
      minion_quantity: minionMap[m.contract_Name] || 0,
    }));

    res.json({
      masterData: enrichedMasterData,
      minionData: enrichedMinionData,
    });
  } catch (err) {
    console.error("getReconTradeData error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
