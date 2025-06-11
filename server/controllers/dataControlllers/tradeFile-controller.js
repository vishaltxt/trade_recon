import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import { parse } from "csv-parse/sync";
import _ from "lodash";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { TradeFile } from "../../modals/tradeData/dataModel.js";
import { MappingForm } from "../../modals/formModels/mappingFormModel.js";

dayjs.extend(customParseFormat);

const formatDate = (date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}${mm}${yyyy}`;
};

const prevformatDate = (date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${yyyy}${mm}${dd}`;
};
const standardizeExpiry = (expiry) => {
  if (!expiry) return "";
  expiry = expiry.trim().toUpperCase();

  const isoMatch = /^\d{4}-\d{2}-\d{2}$/;
  if (isoMatch.test(expiry)) {
    return expiry;
  }

  // Convert e.g. 26JUN2025 to 26Jun2025 (capitalize the month part)
  const match = expiry.match(/^(\d{2})([A-Z]{3})(\d{4})$/);
  if (match) {
    const day = match[1];
    const month = match[2].charAt(0) + match[2].slice(1).toLowerCase();
    const year = match[3];
    const newExpiry = `${day}${month}${year}`;
    const parsed = dayjs(newExpiry, "DDMMMYYYY", true);
    if (parsed.isValid()) {
      return parsed.format("YYYY-MM-DD");
    }
  }

  // Fallback formats
  const fallbackFormats = [
    "DD-MMM-YYYY",
    "DD/MMM/YYYY",
    "DD MMM YYYY",
    "DD MMM, YYYY"
  ];
  for (const fmt of fallbackFormats) {
    const fallbackParsed = dayjs(expiry, fmt, true);
    if (fallbackParsed.isValid()) {
      return fallbackParsed.format("YYYY-MM-DD");
    }
  }

  console.warn(`Warning: Could not parse expiry: ${expiry}`);
  return expiry;
};
// Should output: "2025-06-26"
// console.log(standardizeExpiry("26JUN2025"));

// 🔍 Helper to get the latest file date from the directory
const getLatestFileDate = (baseDir) => {
  const files = fs.readdirSync(baseDir);
  const pattern = /^Position_NCL_FO_0_CM_06432_(\d{8})_F_0000\.csv$/;

  const dates = files
    .map((file) => {
      const match = file.match(pattern);
      if (match) {
        const dateStr = match[1];
        const yyyy = parseInt(dateStr.slice(0, 4), 10);
        const mm = parseInt(dateStr.slice(4, 6), 10);
        const dd = parseInt(dateStr.slice(6, 8), 10);
        return new Date(yyyy, mm - 1, dd);
      }
      return null;
    })
    .filter(Boolean);

  if (dates.length === 0) {
    return null; // no files found
  }

  dates.sort((a, b) => b - a); // descending order
  return dates[0];
};

const keys46 = [
  "Sgmt",
  "Src",
  "RptgDt",
  "BizDt",
  "TradRegnOrgn",
  "ClrMmbId",
  "BrkrOrCtdnPtcptId",
  "ClntTp",
  "master_id",
  "FinInstrmTp",
  "ISIN",
  "symbol",
  "expiry",
  "FininstrmActlXpryDt",
  "strike_price",
  "option_type",
  "NewBrdLotQty",
  "OpngLngQty",
  "OpngLngVal",
  "OpngShrtQty",
  "OpngShrtVal",
  "OpnBuyTradgQty",
  "OpnBuyTradgVal",
  "OpnSellTradgQty",
  "OpnSellTradgVal",
  "PreExrcAssgndLngQty",
  "PreExrcAssgndLngVal",
  "PreExrcAssgndShrtQty",
  "PreExrcAssgndShrtVal",
  "ExrcdQty",
  "AssgndQty",
  "quantity1",
  "PstExrcAssgndLngVal",
  "quantity2",
  "PstExrcAssgndShrtVal",
  "SttlmPric",
  "RefRate",
  "PrmAmt",
  "DalyMrkToMktSettlmVal",
  "FutrsFnlSttlmVal",
  "ExrcAssgndVal",
  "Rmks",
  "Rsvd1",
  "Rsvd2",
  "Rsvd3",
  "Rsvd4",
];

const keys26 = [
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

const readFileAndParse = (filePath, dateStr, keys) => {
  return new Promise((resolve) => {
    if (!filePath) return resolve([]);

    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".txt") {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.warn(
            `Warning: Could not read text file ${filePath}`,
            err.message
          );
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
    } else if (ext === ".csv") {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.warn(
            `Warning: Could not read CSV file ${filePath}`,
            err.message
          );
          return resolve([]);
        }
        try {
          const records = parse(data, {
            columns: keys,
            skip_empty_lines: true,
            trim: true,
          });
          // 🚨 Skip the header row if necessary
          let parsedData = records;
          if (parsedData.length > 0) {
            const firstRow = parsedData[0];
            const firstRowIsHeader = keys.some(
              (key) =>
                firstRow[key] &&
                firstRow[key].toLowerCase() === key.toLowerCase()
            );
            if (firstRowIsHeader) {
              parsedData = parsedData.slice(1);
            }
          }

          parsedData = parsedData.map((row) => {
            row.fileDate = dateStr;
            return row;
          });
          resolve(parsedData);
        } catch (parseErr) {
          console.warn(
            `Warning: Could not parse CSV file ${filePath}`,
            parseErr.message
          );
          resolve([]);
        }
      });
    } else if (ext === ".xlsx" || ext === ".xls") {
      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(sheet, {
          header: keys,
          defval: "",
        });
        const parsedData = json.map((row) => {
          row.fileDate = dateStr;
          return row;
        });
        resolve(parsedData);
      } catch (err) {
        console.warn(
          `Warning: Could not read Excel file ${filePath}`,
          err.message
        );
        resolve([]);
      }
    } else {
      console.warn(`Unsupported file type: ${filePath}`);
      resolve([]);
    }
  });
};

export const TradeFileData = async (req, res) => {
  try {
    const baseDir = process.env.FILE_PATH || "./data";
    const today = new Date();
    const todayStr = formatDate(today);

    const latestPrevDate = getLatestFileDate(baseDir);
    const previousFileDate = latestPrevDate
      ? prevformatDate(latestPrevDate)
      : null;

    if (!previousFileDate) {
      console.warn(
        "No previous file found for Position_NCL_FO_0_CM_06432_*.csv"
      );
    }

    const todayFilePath = path.join(baseDir, `TradeFo_${todayStr}.txt`);
    const previousFilePath = previousFileDate
      ? path.join(
          baseDir,
          `Position_NCL_FO_0_CM_06432_${previousFileDate}_F_0000.csv`
        )
      : null;

    const [prevData, todayData] = await Promise.all([
      previousFileDate
        ? readFileAndParse(previousFilePath, previousFileDate, keys46)
        : [],
      readFileAndParse(todayFilePath, todayStr, keys26),
    ]);

    const validDates = [previousFileDate, todayStr].filter(Boolean);
    console.log("validDates:", validDates);

    // Clean up old records
    await TradeFile.deleteMany({
      $or: [
        { fileDate: { $exists: false } },
        { fileDate: { $nin: validDates } },
      ],
    });

    let insertedCount = 0;
    let insertedData = [];

    const cleanString = (str) =>
      typeof str === "string" ? str.trim().replace(/\s+/g, " ") : str;

    // Insert yesterday's data AS IS (no transformation)
    if (prevData.length > 0) {
      const existing = await TradeFile.countDocuments({
        fileDate: previousFileDate,
      });
      if (existing === 0) {
        const transformedPrevData = prevData.map((item) => {
          const transformedItem = {};
          keys46.forEach((key) => {
            transformedItem[key] = cleanString(item[key]);
          });
          transformedItem.fileDate = previousFileDate;
          transformedItem.expiry = standardizeExpiry(item.expiry);
          const qty1 = parseInt(item.quantity1) || 0;
          const qty2 = parseInt(item.quantity2) || 0;
          transformedItem.quantity = qty1 - qty2;
          // transformedItem.option_type = item.option_type || "";
          return transformedItem;
        });
        const inserted = await TradeFile.insertMany(transformedPrevData);
        insertedCount += inserted.length;
        insertedData = insertedData.concat(inserted);
      }
    }
    // Aggregate today's data
    if (todayData.length > 0) {
      await TradeFile.deleteMany({ fileDate: todayStr });

      // const grouped = _.groupBy(todayData, (item) =>
      //   [
      //     cleanString(item.symbol),
      //     cleanString(item.expiry),
      //     cleanString(item.strike_price),
      //     cleanString(item.master_id),
      //   ].join("|")
      // );

      const grouped = _.groupBy(todayData, (item) => {
        const symbol = cleanString(item.symbol);
        const expiry = standardizeExpiry(item.expiry);
        const strike_price = cleanString(item.strike_price);
        const master_id = cleanString(item.master_id);
        const option_type = cleanString(item.option_type);
        return [symbol, expiry, strike_price, master_id, option_type].join("|");
      });

      const transformedTodayData = Object.values(grouped).map((group) => {
        let buy_quantity = 0;
        let sell_quantity = 0;
        group.forEach((item) => {
          const qty = parseInt(item.quantity) || 0;
          const buy_sell = Number(item.buy_sell);
          if (buy_sell === 1) buy_quantity += qty;
          else if (buy_sell === 2) sell_quantity += qty;
        });

        const net_quantity = buy_quantity - sell_quantity;

        const [symbol, expiry, strike_price, master_id, option_type] = [
          cleanString(group[0].symbol),
          standardizeExpiry(cleanString(group[0].expiry)),
          cleanString(group[0].strike_price),
          cleanString(group[0].master_id),
          cleanString(group[0].option_type),
        ];

        return {
          symbol,
          expiry,
          strike_price,
          option_type,
          buy_quantity,
          sell_quantity,
          net_quantity,
          master_id,
          fileDate: todayStr,
        };
      });

      const inserted = await TradeFile.insertMany(transformedTodayData);
      insertedCount += inserted.length;
      insertedData = insertedData.concat(inserted);
    }

    res.json({
      inserted: insertedCount,
      keptDates: validDates,
      insertedData,
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// savind data without buy_sell and quantity\

// import fs from "fs";
// import path from "path";
// import xlsx from "xlsx";
// import { parse } from "csv-parse/sync"; // recommended CSV parser
// import { TradeFile } from "../../modals/tradeData/dataModel.js";
// import { MappingForm } from "../../modals/formModels/mappingFormModel.js";

// const formatDate = (date) => {
//   const dd = String(date.getDate()).padStart(2, "0");
//   const mm = String(date.getMonth() + 1).padStart(2, "0");
//   const yyyy = date.getFullYear();
//   return `${dd}${mm}${yyyy}`;
// };
// const prevformatDate = (date) => {
//   const dd = String(date.getDate()).padStart(2, "0");
//   const mm = String(date.getMonth() + 1).padStart(2, "0");
//   const yyyy = date.getFullYear();
//   return `${yyyy}${mm}${dd}`;
// };

// const keys46 = [
//   "Sgmt",
//   "Src",
//   "RptgDt",
//   "BizDt",
//   "TradRegnOrgn",
//   "ClrMmbId",
//   "BrkrOrCtdnPtcptId",
//   "ClntTp",
//   "master_id",
//   "FinInstrmTp",
//   "ISIN",
//   "symbol",
//   "expiry",
//   "FininstrmActlXpryDt",
//   "strike_price",
//   "OptnTp",
//   "NewBrdLotQty",
//   "OpngLngQty",
//   "OpngLngVal",
//   "OpngShrtQty",
//   "OpngShrtVal",
//   "OpnBuyTradgQty",
//   "OpnBuyTradgVal",
//   "OpnSellTradgQty",
//   "OpnSellTradgVal",
//   "PreExrcAssgndLngQty",
//   "PreExrcAssgndLngVal",
//   "PreExrcAssgndShrtQty",
//   "PreExrcAssgndShrtVal",
//   "ExrcdQty",
//   "AssgndQty",
//   "PstExrcAssgndLngQty",
//   "PstExrcAssgndLngVal",
//   "quantity",
//   "PstExrcAssgndShrtVal",
//   "SttlmPric",
//   "RefRate",
//   "PrmAmt",
//   "DalyMrkToMktSettlmVal",
//   "FutrsFnlSttlmVal",
//   "ExrcAssgndVal",
//   "Rmks",
//   "Rsvd1",
//   "Rsvd2",
//   "Rsvd3",
//   "Rsvd4",
// ];
// const keys26 = [
//   "id",
//   "segment",
//   "instrument",
//   "symbol",
//   "expiry",
//   "strike_price",
//   "option_type",
//   "contract_Name",
//   "multiplier",
//   "product_type",
//   "lot_size",
//   "client_code",
//   "price",
//   "buy_sell",
//   "quantity",
//   "quantitya",
//   "order_no",
//   "master_id",
//   "trade_no",
//   "status",
//   "cover",
//   "order_time",
//   "trade_time",
//   "exchange_order_id",
//   "ref_no",
//   "entry_time",
//   "branch_code",
// ];

// // Unified parser for txt/csv/xlsx
// const readFileAndParse = (filePath, dateStr, keys) => {
//   return new Promise((resolve) => {
//     if (!filePath) return resolve([]);

//     const ext = path.extname(filePath).toLowerCase();

//     if (ext === ".txt") {
//       fs.readFile(filePath, "utf8", (err, data) => {
//         if (err) {
//           console.warn(
//             `Warning: Could not read text file ${filePath}`,
//             err.message
//           );
//           return resolve([]);
//         }
//         const lines = data.trim().split("\r\n").filter(Boolean);
//         const parsedData = lines.map((line) => {
//           const values = line.split(",");
//           const obj = {};
//           keys.forEach((key, i) => {
//             obj[key] = values[i] || "";
//           });
//           obj.fileDate = dateStr;
//           return obj;
//         });
//         resolve(parsedData);
//       });
//     } else if (ext === ".csv") {
//       fs.readFile(filePath, "utf8", (err, data) => {
//         if (err) {
//           console.warn(
//             `Warning: Could not read CSV file ${filePath}`,
//             err.message
//           );
//           return resolve([]);
//         }
//         try {
//           const records = parse(data, {
//             columns: keys,
//             skip_empty_lines: true,
//             trim: true,
//           });
//           const parsedData = records.map((row) => {
//             row.fileDate = dateStr;
//             return row;
//           });
//           resolve(parsedData);
//         } catch (parseErr) {
//           console.warn(
//             `Warning: Could not parse CSV file ${filePath}`,
//             parseErr.message
//           );
//           resolve([]);
//         }
//       });
//     } else if (ext === ".xlsx" || ext === ".xls") {
//       try {
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         const json = xlsx.utils.sheet_to_json(sheet, {
//           header: keys,
//           defval: "",
//         });
//         const parsedData = json.map((row) => {
//           row.fileDate = dateStr;
//           return row;
//         });
//         resolve(parsedData);
//       } catch (err) {
//         console.warn(
//           `Warning: Could not read Excel file ${filePath}`,
//           err.message
//         );
//         resolve([]);
//       }
//     } else {
//       console.warn(`Unsupported file type: ${filePath}`);
//       resolve([]);
//     }
//   });
// };

// export const TradeFileData = async (req, res) => {
//   try {
//     const baseDir = process.env.FILE_PATH || "./data";
//     const today = new Date();
//     const todayStr = formatDate(today);
//     const previousFileDate = prevformatDate(new Date(2025, 4, 27)); // 27 May 2025

//     const todayFilePath = path.join(baseDir, `TradeFo_${todayStr}.txt`);
//     const previousFilePath = path.join(
//       baseDir,
//       `Position_NCL_FO_0_CM_06432_${previousFileDate}_F_0000.csv`
//     );

//     const [prevData, todayData] = await Promise.all([
//       readFileAndParse(previousFilePath, previousFileDate, keys46),
//       readFileAndParse(todayFilePath, todayStr, keys26),
//     ]);

//     const combined = [...prevData, ...todayData];
//     const validDates = [previousFileDate, todayStr].filter(Boolean);

//     await TradeFile.deleteMany({
//       $or: [
//         { fileDate: { $exists: false } },
//         { fileDate: { $nin: validDates } },
//       ],
//     });

//     let insertedCount = 0;
//     let insertedData = [];

//     const cleanString = (str) =>
//       typeof str === "string" ? str.trim().replace(/\s+/g, " ") : str;

//     for (const dateStr of validDates) {
//       const dateData = combined.filter((item) => item.fileDate === dateStr);
//       const existing = await TradeFile.countDocuments({ fileDate: dateStr });

//       if (existing === 0 && dateData.length > 0) {
//         const transformed = dateData.map((item) => ({
//           symbol: cleanString(item.symbol),
//           expiry: cleanString(item.expiry),
//           strike_price: cleanString(item.strike_price),
//           buy_sell: Number(item.buy_sell),
//           quantity: parseInt(item.quantity) || 0,
//           master_id: Number(item.master_id),
//           fileDate: item.fileDate,
//         }));

//         const inserted = await TradeFile.insertMany(transformed);
//         insertedCount += inserted.length;
//         insertedData = insertedData.concat(inserted);
//       }
//     }

//     res.json({
//       inserted: insertedCount,
//       keptDates: validDates,
//       insertedData,
//     });
//   } catch (error) {
//     console.error("Controller error:", error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

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

// "Sgmt",
//       "Src",
//       "RptgDt",
//       "BizDt",
//       "TradRegnOrgn",
//       "ClrMmbId",
//       "BrkrOrCtdnPtcptId",
//       "ClntTp",
//       "ClntId",
//       "FinInstrmTp",
//       "ISIN",
//       "TckrSymb",
//       "XpryDt",
//       "FininstrmActlXpryDt",
//       "StrkPric",
//       "OptnTp",
//       "NewBrdLotQty",
//       "OpngLngQty",
//       "OpngLngVal",
//       "OpngShrtQty",
//       "OpngShrtVal",
//       "OpnBuyTradgQty",
//       "OpnBuyTradgVal",
//       "OpnSellTradgQty",
//       "OpnSellTradgVal",
//       "PreExrcAssgndLngQty",
//       "PreExrcAssgndLngVal",
//       "PreExrcAssgndShrtQty",
//       "PreExrcAssgndShrtVal",
//       "ExrcdQty",
//       "AssgndQty",
//       "PstExrcAssgndLngQty",
//       "PstExrcAssgndLngVal",
//       "PstExrcAssgndShrtQty",
//       "PstExrcAssgndShrtVal",
//       "SttlmPric",
//       "RefRate",
//       "PrmAmt",
//       "DalyMrkToMktSettlmVal",
//       "FutrsFnlSttlmVal",
//       "ExrcAssgndVal",
//       "Rmks",
//       "Rsvd1",
//       "Rsvd2",
//       "Rsvd3",
//       "Rsvd4",

// Sgmt,	Src	,RptgDt,BizDt	,TradRegnOrgn	,ClrMmbId,	BrkrOrCtdnPtcptId	,ClntTp	,ClntId,	FinInstrmTp,	ISIN,	TckrSymb	,XpryDt	,FininstrmActlXpryDt	,StrkPric,	OptnTp	,NewBrdLotQty	,OpngLngQty,	OpngLngVal	,OpngShrtQty	,OpngShrtVal	,OpnBuyTradgQty	,OpnBuyTradgVal	,OpnSellTradgQty	,OpnSellTradgVal	,PreExrcAssgndLngQty	,PreExrcAssgndLngVal	,PreExrcAssgndShrtQty,	PreExrcAssgndShrtVal	,ExrcdQty	,AssgndQty	,PstExrcAssgndLngQty	,PstExrcAssgndLngVal	,PstExrcAssgndShrtQty	,PstExrcAssgndShrtVal	,SttlmPric	,RefRate	,PrmAmt	,DalyMrkToMktSettlmVal,	FutrsFnlSttlmVal	,ExrcAssgndVal	,Rmks	,Rsvd1	,Rsvd2	,Rsvd3	,Rsvd4

// final one

// import fs from "fs";
// import path from "path";
// import { TradeFile } from "../../modals/tradeData/dataModel.js";
// import { MappingForm } from "../../modals/formModels/mappingFormModel.js";

// const formatDate = (date) => {
//   const dd = String(date.getDate()).padStart(2, "0");
//   const mm = String(date.getMonth() + 1).padStart(2, "0");
//   const yyyy = date.getFullYear();
//   return `${dd}${mm}${yyyy}`;
// };

// const findLatestAvailableFile = async (startDate, baseDir, maxTries = 7) => {
//   for (let i = 1; i <= maxTries; i++) {
//     const testDate = new Date(startDate);
//     testDate.setDate(testDate.getDate() - i);
//     const dateStr = formatDate(testDate);
//     const filePath = path.join(baseDir, `TradeFo_${dateStr}.txt`);
//     if (fs.existsSync(filePath)) return { filePath, dateStr };
//   }
//   return null;
// };

// const readFileAndParse = (filePath, dateStr, keys) => {
//   return new Promise((resolve) => {
//     if (!filePath) return resolve([]);
//     fs.readFile(filePath, "utf8", (err, data) => {
//       if (err) {
//         console.warn(`Warning: Could not read file ${filePath}`, err.message);
//         return resolve([]);
//       }
//       const lines = data.trim().split("\r\n").filter(Boolean);
//       const parsedData = lines.map((line) => {
//         const values = line.split(",");
//         const obj = {};
//         keys.forEach((key, i) => {
//           obj[key] = values[i] || "";
//         });
//         obj.fileDate = dateStr;
//         return obj;
//       });
//       resolve(parsedData);
//     });
//   });
// };

// export const TradeFileData = async (req, res) => {
//   try {
//     const baseDir = process.env.FILE_PATH || "./data";
//     const today = new Date();
//     const todayStr = formatDate(today);
//     const todayFilePath = path.join(baseDir, `TradeFo_${todayStr}.txt`);
//     const previous = await findLatestAvailableFile(today, baseDir);

//     const keys = [
//       "id",
//       "segment",
//       "instrument",
//       "symbol",
//       "expiry",
//       "strike_price",
//       "option_type",
//       "contract_Name",
//       "multiplier",
//       "product_type",
//       "lot_size",
//       "client_code",
//       "price",
//       "buy_sell",
//       "quantity",
//       "quantitya",
//       "order_no",
//       "master_id",
//       "trade_no",
//       "status",
//       "cover",
//       "order_time",
//       "trade_time",
//       "exchange_order_id",
//       "ref_no",
//       "entry_time",
//       "branch_code",
//     ];

//     const [prevData, todayData] = await Promise.all([
//       readFileAndParse(previous?.filePath, previous?.dateStr, keys),
//       readFileAndParse(todayFilePath, todayStr, keys),
//     ]);

//     const combined = [...prevData, ...todayData];
//     const validDates = [todayStr, previous?.dateStr].filter(Boolean);

//     // Clean up unwanted data
//     await TradeFile.deleteMany({
//       $or: [
//         { fileDate: { $exists: false } },
//         { fileDate: { $nin: validDates } },
//       ],
//     });

//     let insertedCount = 0;
//     let insertedData = [];

//     for (const dateStr of validDates) {
//       const dateData = combined.filter((item) => item.fileDate === dateStr);
//       const existing = await TradeFile.countDocuments({ fileDate: dateStr });

//       if (existing === 0 && dateData.length > 0) {
//         const cleanString = (str) =>
//           typeof str === "string" ? str.trim().replace(/\s+/g, " ") : str;

//         const transformed = dateData.map((item) => ({
//           symbol: cleanString(item.symbol),
//           expiry: cleanString(item.expiry),
//           strike_price: item.strike_price,
//           contract_Name: cleanString(item.contract_Name),
//           buy_sell: Number(item.buy_sell),
//           quantity: parseInt(item.quantity) || 0,
//           master_id: Number(item.master_id),
//           fileDate: item.fileDate,
//         }));

//         const inserted = await TradeFile.insertMany(transformed);
//         insertedCount += inserted.length;
//         insertedData = insertedData.concat(inserted);
//       }
//     }

//     res.json({
//       inserted: insertedCount,
//       keptDates: validDates,
//       insertedData, // Added this
//     });
//   } catch (error) {
//     console.error("Controller error:", error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// // "id",
// //       "segment",
// //       "instrument",
// //       "symbol",
// //       "expiry",
// //       "strike_price",
// //       "option_type",
// //       "contract",
// //       "multiplier",
// //       "product_type",
// //       "lot_size",
// //       "client_code",
// //       "field_1",
// //       "field_2",
// //       "price",
// //       "quantity",
// //       "field_3",
// //       "order_no",
// //       "trade_no",
// //       "status",
// //       "cover",
// //       "order_time",
// //       "trade_time",
// //       "exchange_order_id",
// //       "ref_no",
// //       "entry_time",
// //       "branch_code",

// // I have to get masters and the minions from the backend and then filter,add,and display the master and the minion of that code in the frontend

// // export const getReconTradeData = async (req, res) => {
// //   try {
// //     const { masterTraderIds } = req.body;
// // console.log("Received body:", req.body);

// //     if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
// //       return res.status(400).json({ error: "No master IDs provided" });
// //     }

// //     // Convert master IDs to strings for mapping lookup
// //     const masterIdStrings = masterTraderIds.map(String);

// //     // 1. Fetch mappings+
// //     const mappings = await MappingForm.find({
// //       masterId: { $in: masterIdStrings },
// //     });
// //     const minionIdStrings = mappings.map((m) => m.minionId);
// //     console.log("Mappings found:", mappings);
// //     console.log("Minion IDs:", minionIdStrings);

// //     // 2. Convert master & minion IDs to numbers for trade data lookup
// //     const masterIdNums = masterIdStrings.map(Number);
// //     const minionIdNums = minionIdStrings.map(Number);

// //     // 3. Fetch trade data
// //     const [masterData, minionData] = await Promise.all([
// //       TradeFile.find({ master_id: { $in: masterIdNums } }),
// //       TradeFile.find({ master_id: { $in: minionIdNums } }),
// //     ]);
// //     // console.log(masterData);

// //     res.json({
// //       masterData,
// //       minionData,
// //     });
// //   } catch (err) {
// //     console.error("getReconTradeData error:", err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // };

// // import { TradeFile } from "../models/tradeFile.js";
// // import { MappingForm } from "../models/mappingForm.js";

// // export const getReconTradeData = async (req, res) => {
// //   try {
// //     const { masterTraderIds } = req.body;
// //     // const {minionClientCodes} = req.body;
// //     console.log("Received body:", req.body);

// //     if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
// //       return res.status(400).json({ error: "No master IDs provided" });
// //     }

// //     // Convert master IDs to strings for mapping lookup
// //     const masterIdStrings = masterTraderIds.map(String);

// //     // 1. Fetch mappings
// //     const mappings = await MappingForm.find({
// //       masterId: { $in: masterIdStrings },
// //     });

// //     const minionIdStrings = mappings.map((m) => m.minionId);
// //     console.log("Mappings found:", mappings);
// //     console.log("Minion IDs:", minionIdStrings);

// //     // 2. Convert to numbers
// //     const masterIdNums = masterIdStrings.map(Number);
// //     const minionIdNums = minionIdStrings.map(Number);

// //     // 3. Aggregation pipeline function
// //     const aggregateGroupedData = (ids) => [
// //       {
// //         $match: {
// //           master_id: { $in: ids },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: {
// //             contract_Name: "$contract_Name",
// //             buy_sell: "$buy_sell",
// //           },
// //           total_quantity: { $sum: "$quantity" },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: "$_id.contract_Name",
// //           quantities: {
// //             $push: {
// //               buy_sell: "$_id.buy_sell",
// //               total_quantity: "$total_quantity",
// //             },
// //           },
// //         },
// //       },
// //       {
// //         $project: {
// //           _id: 0,
// //           contract_Name: "$_id",
// //           buy: {
// //             $sum: {
// //               $map: {
// //                 input: {
// //                   $filter: {
// //                     input: "$quantities",
// //                     as: "item",
// //                     cond: { $eq: ["$$item.buy_sell", 1] },
// //                   },
// //                 },
// //                 as: "b",
// //                 in: "$$b.total_quantity",
// //               },
// //             },
// //           },
// //           sell: {
// //             $sum: {
// //               $map: {
// //                 input: {
// //                   $filter: {
// //                     input: "$quantities",
// //                     as: "item",
// //                     cond: { $eq: ["$$item.buy_sell", 2] },
// //                   },
// //                 },
// //                 as: "s",
// //                 in: "$$s.total_quantity",
// //               },
// //             },
// //           },
// //         },
// //       },
// //     ];

// //     // 4. Run both aggregations in parallel
// //     const [masterData, minionData] = await Promise.all([
// //       TradeFile.aggregate(aggregateGroupedData(masterIdNums)),
// //       TradeFile.aggregate(aggregateGroupedData(minionIdNums)),
// //     ]);

// //     // 5. Return response
// //     res.json({
// //       masterData,
// //       minionData,
// //     });
// //   } catch (err) {
// //     console.error("getReconTradeData error:", err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // };

// // BUY / SELL logic
// // export const getReconTradeData = async (req, res) => {
// //   try {
// //     const { masterTraderIds } = req.body;
// //     console.log("Received body:", req.body);

// //     if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
// //       return res.status(400).json({ error: "No master IDs provided" });
// //     }

// //     const masterIdStrings = masterTraderIds.map(String);

// //     // 1. Fetch mappings
// //     const mappings = await MappingForm.find({
// //       masterId: { $in: masterIdStrings },
// //     });

// //     const minionIdStrings = mappings.map((m) => m.minionId);
// //     console.log("Mappings found:", mappings);
// //     console.log("Minion IDs:", minionIdStrings);

// //     // Convert to numbers
// //     const masterIdNums = masterIdStrings.map(Number);
// //     const minionIdNums = minionIdStrings.map(Number);

// //     // Aggregation pipeline with filtering out zero difference
// //     const aggregateWithDifference = (ids) => [
// //       {
// //         $match: {
// //           master_id: { $in: ids },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: {
// //             contract_Name: "$contract_Name",
// //             buy_sell: "$buy_sell",
// //           },
// //           total_quantity: { $sum: "$quantity" },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: "$_id.contract_Name",
// //           quantities: {
// //             $push: {
// //               buy_sell: "$_id.buy_sell",
// //               total_quantity: "$total_quantity",
// //             },
// //           },
// //         },
// //       },
// //       {
// //         $project: {
// //           contract_Name: "$_id",
// //           buy: {
// //             $sum: {
// //               $map: {
// //                 input: {
// //                   $filter: {
// //                     input: "$quantities",
// //                     as: "item",
// //                     cond: { $eq: ["$$item.buy_sell", 1] },
// //                   },
// //                 },
// //                 as: "b",
// //                 in: "$$b.total_quantity",
// //               },
// //             },
// //           },
// //           sell: {
// //             $sum: {
// //               $map: {
// //                 input: {
// //                   $filter: {
// //                     input: "$quantities",
// //                     as: "item",
// //                     cond: { $eq: ["$$item.buy_sell", 2] },
// //                   },
// //                 },
// //                 as: "s",
// //                 in: "$$s.total_quantity",
// //               },
// //             },
// //           },
// //         },
// //       },
// //       {
// //         $project: {
// //           contract_Name: 1,
// //           total_quantity: { $subtract: ["$buy", "$sell"] },
// //           actionType: {
// //             $cond: [
// //               { $gt: [{ $subtract: ["$buy", "$sell"] }, 0] },
// //               "sell",
// //               "buy",
// //             ],
// //           },
// //         },
// //       },
// //       {
// //         $match: {
// //           total_quantity: { $ne: 0 }, // Filter out neutral values
// //         },
// //       },
// //     ];

// //     // Execute both aggregations in parallel
// //     const [masterData, minionData] = await Promise.all([
// //       TradeFile.aggregate(aggregateWithDifference(masterIdNums)),
// //       TradeFile.aggregate(aggregateWithDifference(minionIdNums)),
// //     ]);

// //     // Respond with filtered and computed data
// //     res.json({
// //       masterData,
// //       minionData,
// //     });
// //   } catch (err) {
// //     console.error("getReconTradeData error:", err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // };

// // With Difference of the masters and minions

// // export const getReconTradeData = async (req, res) => {
// //   try {
// //     const { masterTraderIds } = req.body;
// //     // const {minionClientCodes} = req.body
// //         console.log("Received body:", req.body);

// //     if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
// //       return res.status(400).json({ error: "No master IDs provided" });
// //     }

// //     const masterIdStrings = masterTraderIds.map(String);

// //     const mappings = await MappingForm.find({
// //       masterId: { $in: masterIdStrings },
// //     });

// //     const minionIdStrings = mappings.map((m) => m.minionId);
// //     console.log("Mappings found:", mappings);
// //     console.log("Minion IDs:", minionIdStrings);

// //     const masterIdNums = masterIdStrings.map(Number);
// //     const minionIdNums = minionIdStrings.map(Number);

// //     const aggregateGroupedData = (ids) => [
// //       {
// //         $match: { master_id: { $in: ids } },
// //       },
// //       {
// //         $group: {
// //           _id: {
// //             contract_Name: "$contract_Name",
// //             buy_sell: "$buy_sell",
// //           },
// //           total_quantity: { $sum: "$quantity" },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: "$_id.contract_Name",
// //           quantities: {
// //             $push: {
// //               buy_sell: "$_id.buy_sell",
// //               total_quantity: "$total_quantity",
// //             },
// //           },
// //         },
// //       },
// //       {
// //         $project: {
// //           _id: 0,
// //           contract_Name: "$_id",
// //           total_quantity: {
// //             $subtract: [
// //               {
// //                 $sum: {
// //                   $map: {
// //                     input: {
// //                       $filter: {
// //                         input: "$quantities",
// //                         as: "item",
// //                         cond: { $eq: ["$$item.buy_sell", 1] },
// //                       },
// //                     },
// //                     as: "b",
// //                     in: "$$b.total_quantity",
// //                   },
// //                 },
// //               },
// //               {
// //                 $sum: {
// //                   $map: {
// //                     input: {
// //                       $filter: {
// //                         input: "$quantities",
// //                         as: "item",
// //                         cond: { $eq: ["$$item.buy_sell", 2] },
// //                       },
// //                     },
// //                     as: "s",
// //                     in: "$$s.total_quantity",
// //                   },
// //                 },
// //               },
// //             ],
// //           },
// //         },
// //       },
// //       {
// //         $match: { total_quantity: { $ne: 0 } },
// //       },
// //       {
// //         $addFields: {
// //           actionType: {
// //             $cond: [{ $gt: ["$total_quantity", 0] }, "buy", "sell"],
// //           },
// //         },
// //       },
// //     ];

// //     const [masterData, minionData] = await Promise.all([
// //       TradeFile.aggregate(aggregateGroupedData(masterIdNums)),
// //       TradeFile.aggregate(aggregateGroupedData(minionIdNums)),
// //     ]);

// //     // Map both sides for quick lookups
// //     const masterMap = Object.fromEntries(
// //       masterData.map((m) => [m.contract_Name, m.total_quantity])
// //     );
// //     const minionMap = Object.fromEntries(
// //       minionData.map((m) => [m.contract_Name, m.total_quantity])
// //     );

// //     // Enrich each minion record with corresponding master_quantity
// //     const enrichedMinionData = minionData.map((m) => ({
// //       ...m,
// //       master_quantity: masterMap[m.contract_Name] || 0,
// //     }));

// //     // Enrich each master record with corresponding minion_quantity
// //     const enrichedMasterData = masterData.map((m) => ({
// //       ...m,
// //       minion_quantity: minionMap[m.contract_Name] || 0,
// //     }));

// //     res.json({
// //       masterData: enrichedMasterData,
// //       minionData: enrichedMinionData,
// //     });
// //   } catch (err) {
// //     console.error("getReconTradeData error:", err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // };

// // with  master_id updation
// export const getReconTradeData = async (req, res) => {
//   try {
//     const { masterTraderIds } = req.body;
//     console.log("Received body:", req.body);

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

//     const aggregateGroupedData = (ids, includeMasterId = false) => {
//       const pipeline = [
//         {
//           $match: { master_id: { $in: ids } },
//         },
//         ...(includeMasterId
//           ? [
//               {
//                 $addFields: { group_master_id: "$master_id" }, // temporary field for grouping
//               },
//             ]
//           : []),
//         {
//           $group: {
//             _id: {
//               contract_Name: "$contract_Name",
//               buy_sell: "$buy_sell",
//               ...(includeMasterId ? { master_id: "$group_master_id" } : {}),
//             },
//             total_quantity: { $sum: "$quantity" },
//           },
//         },
//         {
//           $group: {
//             _id: {
//               contract_Name: "$_id.contract_Name",
//               ...(includeMasterId ? { master_id: "$_id.master_id" } : {}),
//             },
//             quantities: {
//               $push: {
//                 buy_sell: "$_id.buy_sell",
//                 total_quantity: "$total_quantity",
//               },
//             },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             contract_Name: "$_id.contract_Name",
//             ...(includeMasterId ? { master_id: "$_id.master_id" } : {}),
//             total_quantity: {
//               $subtract: [
//                 {
//                   $sum: {
//                     $map: {
//                       input: {
//                         $filter: {
//                           input: "$quantities",
//                           as: "item",
//                           cond: { $eq: ["$$item.buy_sell", 1] },
//                         },
//                       },
//                       as: "b",
//                       in: "$$b.total_quantity",
//                     },
//                   },
//                 },
//                 {
//                   $sum: {
//                     $map: {
//                       input: {
//                         $filter: {
//                           input: "$quantities",
//                           as: "item",
//                           cond: { $eq: ["$$item.buy_sell", 2] },
//                         },
//                       },
//                       as: "s",
//                       in: "$$s.total_quantity",
//                     },
//                   },
//                 },
//               ],
//             },
//           },
//         },
//         {
//           $match: { total_quantity: { $ne: 0 } },
//         },
//         {
//           $addFields: {
//             actionType: {
//               $cond: [{ $gt: ["$total_quantity", 0] }, "buy", "sell"],
//             },
//           },
//         },
//       ];

//       return pipeline;
//     };

//     const [masterData, minionData] = await Promise.all([
//       TradeFile.aggregate(aggregateGroupedData(masterIdNums, true)), // Include master_id
//       TradeFile.aggregate(aggregateGroupedData(minionIdNums, true)), // Minion doesn't need master_id <-----need
//     ]);
//     ` `;
//     const masterMap = Object.fromEntries(
//       masterData.map((m) => [m.contract_Name, m.total_quantity])
//     );
//     const minionMap = Object.fromEntries(
//       minionData.map((m) => [m.contract_Name, m.total_quantity])
//     );

//     const enrichedMinionData = minionData.map((m) => ({
//       ...m,
//       master_quantity: masterMap[m.contract_Name] || 0,
//     }));

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




// export const getReconTradeData = async (req, res) => {
//   try {
//     const { masterTraderIds } = req.body;
//     console.log("Received body:", req.body);

//     if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
//       return res.status(400).json({ error: "No master IDs provided" });
//     }

//     const masterIdStrings = masterTraderIds.map(String);

//     // Fetch mappings for minion IDs
//     const mappings = await MappingForm.find({
//       masterId: { $in: masterIdStrings },
//     });

//     const minionIdStrings = mappings.map((m) => m.minionId);
//     console.log("Mappings found:", mappings);
//     console.log("Minion IDs:", minionIdStrings);

//     const masterIdNums = masterIdStrings.map(String);
//     const minionIdNums = minionIdStrings.map(String);

//     // Aggregation pipeline for master/minion data
//     const aggregateGroupedData = (ids, includeMasterId = false) => {
//       const pipeline = [
//         {
//           $match: { master_id: { $in: ids } },
//         },
//         ...(includeMasterId
//           ? [
//               {
//                 $addFields: { group_master_id: "$master_id" },
//               },
//             ]
//           : []),
//         {
//           $group: {
//             _id: {
//               symbol: "$symbol",
//               strike_price: "$strike_price",
//               expiry: "$expiry",
//               option_type: "$option_type",
//               ...(includeMasterId ? { master_id: "$group_master_id" } : {}),
//             },
//             total_buy_quantity: { $sum: "$buy_quantity" },
//             total_sell_quantity: { $sum: "$sell_quantity" },
//             total_quantity: {
//               $sum: {
//                 $add: [
//                   { $ifNull: ["$net_quantity", 0] },
//                   { $ifNull: ["$quantity", 0] },
//                 ],
//               },
//             },
//           },
//         },
//         {
//           $match: { total_quantity: { $ne: 0 } },
//         },
//         {
//           $addFields: {
//             actionType: {
//               $cond: [{ $gt: ["$total_quantity", 0] }, "buy", "sell"],
//             },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             symbol: "$_id.symbol",
//             strike_price: "$_id.strike_price",
//             expiry: "$_id.expiry",
//             option_type: "$_id.option_type",
//             ...(includeMasterId ? { master_id: "$_id.master_id" } : {}),
//             total_buy_quantity: 1,
//             total_sell_quantity: 1,
//             total_quantity: 1,
//             actionType: 1,
//           },
//         },
//       ];

//       return pipeline;
//     };

//     const [masterData, minionData] = await Promise.all([
//       TradeFile.aggregate(aggregateGroupedData(masterIdNums, true)),
//       TradeFile.aggregate(aggregateGroupedData(minionIdNums, true)),
//     ]);

//     // Create mappings for comparison
//     const masterMap = {};
//     masterData.forEach((m) => {
//       const key = `${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
//       masterMap[key] = m.total_quantity;
//     });
// console.log(masterMap)
//     const minionMap = {};
//     minionData.forEach((m) => {
//       const key = `${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
//       minionMap[key] = m.total_quantity;
//     });
// // console.log(minionMap);
//     // Enrich minion data with corresponding master quantity
//     const enrichedMinionData = minionData.map((m) => {
//       const key = `${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
//       return {
//         ...m,
//         master_net_quantity: masterMap[key] || 0,
//       };
//     });
// // console.log(enrichedMinionData)
//     // Enrich master data with corresponding minion quantity
//     const enrichedMasterData = masterData.map((m) => {
//       const key = `${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
//       return {
//         ...m,
//         minion_net_quantity: minionMap[key] || 0,
//       };
//     });

//     res.json({
//       masterData: enrichedMasterData,
//       minionData: enrichedMinionData,
//     });
//   } catch (err) {
//     console.error("getReconTradeData error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };




// export const getReconTradeData = async (req, res) => {
//   try {
//     const { masterTraderIds } = req.body;
//     console.log("Received body:", req.body);

//     if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
//       return res.status(400).json({ error: "No master IDs provided" });
//     }

//     const masterIdStrings = masterTraderIds.map(String);

//     // Fetch mappings for minion IDs
//     const mappings = await MappingForm.find({
//       masterId: { $in: masterIdStrings },
//     });

//     const minionIdStrings = mappings.map((m) => m.minionId);
//     console.log("Mappings found:", mappings);
//     console.log("Minion IDs:", minionIdStrings);

//     const masterIdNums = masterIdStrings.map(String);
//     const minionIdNums = minionIdStrings.map(String);

//     // Aggregation pipeline for master/minion data
//     const aggregateGroupedData = (ids, includeMasterId = false) => {
//       const pipeline = [
//         {
//           $match: { master_id: { $in: ids } },
//         },
//         ...(includeMasterId
//           ? [
//               {
//                 $addFields: { group_master_id: "$master_id" },
//               },
//             ]
//           : []),
//         {
//           $group: {
//             _id: {
//               symbol: "$symbol",
//               strike_price: "$strike_price",
//               expiry: "$expiry",
//               option_type: "$option_type",
//               ...(includeMasterId ? { master_id: "$group_master_id" } : {}),
//             },
//             total_buy_quantity: { $sum: "$buy_quantity" },
//             total_sell_quantity: { $sum: "$sell_quantity" },
//             total_quantity: {
//               $sum: {
//                 $add: [
//                   { $ifNull: ["$net_quantity", 0] },
//                   { $ifNull: ["$quantity", 0] },
//                 ],
//               },
//             },
//           },
//         },
//         {
//           $match: { total_quantity: { $ne: 0 } },
//         },
//         {
//           $addFields: {
//             actionType: {
//               $cond: [{ $gt: ["$total_quantity", 0] }, "buy", "sell"],
//             },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             symbol: "$_id.symbol",
//             strike_price: "$_id.strike_price",
//             expiry: "$_id.expiry",
//             option_type: "$_id.option_type",
//             ...(includeMasterId ? { master_id: "$_id.master_id" } : {}),
//             total_buy_quantity: 1,
//             total_sell_quantity: 1,
//             total_quantity: 1,
//             actionType: 1,
//           },
//         },
//       ];

//       return pipeline;
//     };

//     // Run both master and minion data aggregations
//     const [masterData, minionData] = await Promise.all([
//       TradeFile.aggregate(aggregateGroupedData(masterIdNums, true)),
//       TradeFile.aggregate(aggregateGroupedData(minionIdNums, true)),
//     ]);

//     // Create mappings for comparison
//     const masterMap = {};
//     masterData.forEach((m) => {
//       const key = `${m.master_id}_${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
//       masterMap[key] = m.total_quantity;
//     });
// // console.log(masterMap)
//     // Enrich minion data with corresponding master quantity (sum across all relevant masters)
//     const enrichedMinionData = minionData.map((minion) => {
//       let totalMasterNetQty = 0;

//       masterIdNums.forEach((masterId) => {
//         const key = `${masterId}_${minion.symbol}_${minion.strike_price}_${minion.expiry}_${minion.option_type}`;
//         totalMasterNetQty += masterMap[key] || 0;
//       });

//       return {
//         ...minion,
//         master_net_quantity: totalMasterNetQty,
//       };
//     });

//     // Enrich master data with corresponding minion quantity (optional, same logic as before)
//     const minionMap = {};
//     minionData.forEach((m) => {
//       const key = `${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
//       minionMap[key] = (minionMap[key] || 0) + m.total_quantity;
//     });

//     const enrichedMasterData = masterData.map((m) => {
//       const key = `${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
//       return {
//         ...m,
//         minion_net_quantity: minionMap[key] || 0,
//       };
//     });

//     res.json({
//       masterData: enrichedMasterData,
//       minionData: enrichedMinionData,
//     });
//   } catch (err) {
//     console.error("getReconTradeData error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };




export const getReconTradeData = async (req, res) => {
  try {
    const { masterTraderIds } = req.body;
    console.log("Received body:", req.body);

    if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
      return res.status(400).json({ error: "No master IDs provided" });
    }

    const masterIdStrings = masterTraderIds.map(String);

    // Fetch mappings for minion IDs
    const mappings = await MappingForm.find({
      masterId: { $in: masterIdStrings },
    });

    const minionIdStrings = mappings.map((m) => m.minionId);
    console.log("Mappings found:", mappings);
    console.log("Minion IDs:", minionIdStrings);

    const masterIdNums = masterIdStrings.map(String);
    const minionIdNums = minionIdStrings.map(String);

    // Aggregation pipeline for master/minion data
    const aggregateGroupedData = (ids, includeMasterId = false) => {
      const pipeline = [
        {
          $match: { master_id: { $in: ids } },
        },
        ...(includeMasterId
          ? [
              {
                $addFields: { group_master_id: "$master_id" },
              },
            ]
          : []),
        {
          $group: {
            _id: {
              symbol: "$symbol",
              strike_price: "$strike_price",
              expiry: "$expiry",
              option_type: "$option_type",
              ...(includeMasterId ? { master_id: "$group_master_id" } : {}),
            },
            total_buy_quantity: { $sum: "$buy_quantity" },
            total_sell_quantity: { $sum: "$sell_quantity" },
            total_quantity: {
              $sum: {
                $add: [
                  { $ifNull: ["$net_quantity", 0] },
                  { $ifNull: ["$quantity", 0] },
                ],
              },
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
        {
          $project: {
            _id: 0,
            symbol: "$_id.symbol",
            strike_price: "$_id.strike_price",
            expiry: "$_id.expiry",
            option_type: "$_id.option_type",
            ...(includeMasterId ? { master_id: "$_id.master_id" } : {}),
            total_buy_quantity: 1,
            total_sell_quantity: 1,
            total_quantity: 1,
            actionType: 1,
          },
        },
      ];

      return pipeline;
    };

    // Run both master and minion data aggregations
    const [masterData, minionData] = await Promise.all([
      TradeFile.aggregate(aggregateGroupedData(masterIdNums, true)),
      TradeFile.aggregate(aggregateGroupedData(minionIdNums, true)),
    ]);

    // Create mappings for comparison
    const masterMap = {};
    masterData.forEach((m) => {
      const key = `${m.master_id}_${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
      masterMap[key] = m.total_quantity;
    });

    // Build a map of minionId -> set of mapped masterIds
    const minionToMastersMap = {};
    mappings.forEach((mapping) => {
      const minionId = mapping.minionId;
      const masterId = mapping.masterId;
      if (!minionToMastersMap[minionId]) {
        minionToMastersMap[minionId] = new Set();
      }
      minionToMastersMap[minionId].add(masterId);
    });

    // Enrich minion data with corresponding master quantity (sum only mapped masters)
    const enrichedMinionData = minionData.map((minion) => {
      let totalMasterNetQty = 0;

      const mappedMasters = minionToMastersMap[minion.master_id]
        ? Array.from(minionToMastersMap[minion.master_id])
        : [];

      mappedMasters.forEach((masterId) => {
        const key = `${masterId}_${minion.symbol}_${minion.strike_price}_${minion.expiry}_${minion.option_type}`;
        totalMasterNetQty += masterMap[key] || 0;
      });

      return {
        ...minion,
        master_net_quantity: totalMasterNetQty,
      };
    });

    // Enrich master data with corresponding minion quantity (optional)
    const minionMap = {};
    minionData.forEach((m) => {
      const key = `${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
      minionMap[key] = (minionMap[key] || 0) + m.total_quantity;
    });

    const enrichedMasterData = masterData.map((m) => {
      const key = `${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
      return {
        ...m,
        minion_net_quantity: minionMap[key] || 0,
      };
    });

    res.json({
      masterData: enrichedMasterData,
      minionData: enrichedMinionData,
    });
  } catch (err) {
    console.error("getReconTradeData error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
