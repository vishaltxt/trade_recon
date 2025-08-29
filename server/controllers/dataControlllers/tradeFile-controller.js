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

  // Normalize month: 26-JUN-2025 -> 26-Jun-2025
  const normalizeMonth = (str) => {
    return str.replace(
      /(\d{2})-([A-Z]{3})-(\d{4})/,
      (_, day, mon, year) =>
        `${day}-${mon.charAt(0) + mon.slice(1).toLowerCase()}-${year}`
    );
  };

  // expiry = normalizeMonth(expiry);

  // Fallback formats
  expiry = normalizeMonth(expiry);
  const fallbackFormats = [
    "DD-MMM-YYYY",
    "DD/MMM/YYYY",
    "DD MMM YYYY",
    "DD MMM, YYYY",
  ];
  for (const fmt of fallbackFormats) {
    const fallbackParsed = dayjs(expiry, fmt, true);
    if (fallbackParsed.isValid()) {
      return fallbackParsed.format("YYYY-MM-DD");
    }
  }

  if (!standardizeExpiry.warned) standardizeExpiry.warned = new Set();
  if (!standardizeExpiry.warned.has(expiry)) {
    console.warn(`Warning: Could not parse expiry: ${expiry}`);
    standardizeExpiry.warned.add(expiry);
  }
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

const keys37 = [
  "Sgmt",
  "Src",
  "RptgDt",
  "BizDt",
  "TradRegnOrgn",
  "ClrMmbId",
  "BrkrOrCtdnPtcptId",
  "master_id",
  "ClntTp",
  "symbol",
  "expiry",
  "strike_price",
  "option_type",
  "FinInstrmTp",
  "ISIN",
  "FininstrmActlXpryDt",
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
  "quantity1",
  "ExrcdQty",
  "quantity2",
  "PstExrcAssgndLngVal",
  "PstExrcAssgndShrtVal",
  "SttlmPric",
  "RefRate",
  "PrmAmt",
  "DalyMrkToMktSettlmVal",
];

const keysPro37 = [
  "Sgmt",
  "Src",
  "RptgDt",
  "BizDt",
  "TradRegnOrgn",
  "ClrMmbId",
  "BrkrOrCtdnPtcptId",
  "master_twelve",
  "ClntTp",
  "symbol",
  "expiry",
  "strike_price",
  "option_type",
  "FinInstrmTp",
  "ISIN",
  "FininstrmActlXpryDt",
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
  "quantity1",
  "ExrcdQty",
  "quantity2",
  "PstExrcAssgndLngVal",
  "PstExrcAssgndShrtVal",
  "SttlmPric",
  "RefRate",
  "PrmAmt",
  "DalyMrkToMktSettlmVal",
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
  "master_neet",
  "price",
  "buy_sell",
  "quantity",
  "quantitya",
  "order_no",
  "master_id",
  "trade_no",
  "status",
  "cover",
  "trade_time",
  "t_time",
  "exchange_order_id",
  "ref_no",
  "order_time",
  "master_twelve",
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

    //>>>>>>>>>>>>>>>>------------------------------------------------ Add the new file path: --------------------------------------<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // const custposFilePath = previousFileDate
    //   ? path.join(baseDir, `custpos.csv`)
    //   : null;
    const custposFilePath = path.join(baseDir, `custpos.csv`);
    const custposFileDate = "custpos"; // or use a custom label or todayStr

    const ProFilePath = path.join(baseDir, `nowpos.csv`);
    const ProFileDate = "nowpos";

    const [prevData, todayData, newPrevData, newPrevProData] =
      await Promise.all([
        previousFileDate
          ? readFileAndParse(previousFilePath, previousFileDate, keys46)
          : [],
        readFileAndParse(todayFilePath, todayStr, keys26),
        readFileAndParse(custposFilePath, custposFileDate, keys37),
        readFileAndParse(ProFilePath, ProFileDate, keysPro37),
        // previousFileDate
        //   ? readFileAndParse(custposFilePath, previousFileDate, keys37)
        //   : [],
      ]);
    // console.log(newPrevData);
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

    // <<<<<<<<<<<<<<<<<<<<<<<<<<------------------------------------Insert FO yesterday's data AS IS (no transformation)------------------------------------------<<<<<<<<<<<<<<<
    if (prevData.length > 0) {
      const existing = await TradeFile.countDocuments({
        fileDate: previousFileDate,
      });
      console.log("Previous Day FO data:", existing);
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
          transformedItem.option_type = item.option_type || "FF";
          return transformedItem;
        });
        const inserted = await TradeFile.insertMany(transformedPrevData);
        insertedCount += inserted.length;
        insertedData = insertedData.concat(inserted);

        // ❌ Delete entries where expiry === fileDate
        const fileDateAsExpiry = dayjs(previousFileDate, "YYYYMMDD").format(
          "YYYY-MM-DD"
        );
        await TradeFile.deleteMany({
          fileDate: previousFileDate,
          expiry: fileDateAsExpiry,
        });
        console.log(
          `Deleted entries of yesterday FO file where expiry === fileDate (${fileDateAsExpiry})`
        );
      }
    }

    //<<<<<<<<<<<<<<<<<<<--------------------------------------------- Insert CUSTPOS file: --------------------------------------------------<<<<<<<<<<<<<<<<<<<<<<<<

    if (newPrevData.length > 0) {
      const existingNew = await TradeFile.countDocuments({
        fileDate: custposFileDate,
        // source: "newPrevData",
      });
      // console.log(existingNew);
      if (existingNew === 0) {
        // console.log("custpos data ", existingNew);
        const transformedNewPrevData = newPrevData.map((item) => {
          const transformedItem = {};
          keys37.forEach((key) => {
            transformedItem[key] = cleanString(item[key]);
          });
          transformedItem.fileDate = custposFileDate;
          transformedItem.expiry = standardizeExpiry(item.expiry);
          const qty1 = parseInt(item.quantity1) || 0;
          const qty2 = parseInt(item.quantity2) || 0;
          transformedItem.quantity = qty1 - qty2;
          // transformedItem.source = "newPrevData";
          return transformedItem;
        });
        const inserted = await TradeFile.insertMany(transformedNewPrevData);
        insertedCount += inserted.length;
        insertedData = insertedData.concat(inserted);
        console.log("custpos data:", insertedCount);

        // const custposExpiryDate = dayjs(previousFileDate, "YYYYMMDD").format(
        //   "YYYY-MM-DD"
        // );
        // await TradeFile.deleteMany({
        //   fileDate: custposFileDate,
        //   expiry: custposExpiryDate,
        // });
        // console.log(
        //   `Deleted custpos entries where expiry === previous file date (${custposExpiryDate})`
        // );
      }
    }

    //<<<<<<<<<<<<<<<<<<<<<<<------------------------------------ Insert PRO newpos file:---------------------------------------------------------<<<<<<<<<<<<<<<<<<<<<

    const masterIdProMappings = {
      PRO24: "382355555003",
      PRO18: "110001555005",
      PRO15: "201301301001",
      PRO21: "201301555002",
      PRO37: "201301901001",
      B024: "201301777002",
      B025: "201301777001",
// -----MASTERS  pro37,01141
      PRO30: "4156", 
      PRO31: "57492",
      PRO32: "10994",   
      PRO33: "4153",
      PRO34: "40443",
      PRO35: "4183",
      //  ------ PRO16 MINION
      PRO16: "110001888001"
    };

    if (newPrevProData.length > 0) {
      const existingNewPro = await TradeFile.countDocuments({
        fileDate: ProFileDate,
        // source: "newPrevData",
      });
      // console.log(existingNewPro);
      if (existingNewPro === 0) {
        const transformedNewPrevProData = newPrevProData.map((item) => { 
          const transformedItem = {};
          // keysPro37.forEach((key) => {
          //   transformedItem[key] = cleanString(item[key]);
          // });
          keysPro37.forEach((key) => {
            let value = cleanString(item[key]);

            // Replace master_twelve if it's in the mapping
            if (key === "master_twelve" && masterIdProMappings[value]) {
              value = masterIdProMappings[value];
            }
            transformedItem[key] = value;
          });

          transformedItem.fileDate = ProFileDate;
          transformedItem.expiry = standardizeExpiry(item.expiry);
          const qty1 = parseInt(item.quantity1) || 0;
          const qty2 = parseInt(item.quantity2) || 0;
          transformedItem.quantity = qty1 - qty2;
          // transformedItem.source = "newPrevData";
          return transformedItem;
        });
        const inserted = await TradeFile.insertMany(transformedNewPrevProData);
        insertedCount += inserted.length;
        insertedData = insertedData.concat(inserted);
        console.log("custNew Pro data:", insertedCount);
      }
    }

    // >>>>>>>>>>>>>>>>>>>>----------------------------------------- Sensex file:  ----------------------------------------------------------------<<<<<<<<<<<<<<<<<<<<<<<<

    // >>>>>>>>>>>>>>>>>>>>---------------------------------------Aggregate FO today's data  ------------------------------------------------------<<<<<<<<<<<<<<<<<<<<<<<<<<<

    if (todayData.length > 0) {
      await TradeFile.deleteMany({ fileDate: todayStr });

      const grouped = _.groupBy(todayData, (item) => {
        const symbol = cleanString(item.symbol);
        const expiry = standardizeExpiry(item.expiry);
        const strike_price = cleanString(item.strike_price) || 0;
        const master_id = cleanString(item.master_id);
        const master_neet = cleanString(item.master_neet);
        const master_twelve = cleanString(item.master_twelve);
        const option_type = cleanString(item.option_type) || "FF";
        const trade_time = cleanString(item.trade_time);
        return [
          symbol,
          expiry,
          strike_price,
          master_id,
          master_neet,
          master_twelve,
          option_type,
          trade_time,
        ].join("|");
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

        const [
          symbol,
          expiry,
          strike_price,
          master_id,
          master_neet,
          master_twelve,
          option_type,
          trade_time,
        ] = [
          cleanString(group[0].symbol),
          standardizeExpiry(cleanString(group[0].expiry)),
          cleanString(group[0].strike_price) || 0,
          cleanString(group[0].master_id),
          cleanString(group[0].master_neet),
          // cleanString(group[0].master_twelve),
          cleanString(group[0].master_twelve).slice(0, 12),
          cleanString(group[0].option_type) || "FF",
          cleanString(group[0].trade_time),
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
          master_neet,
          master_twelve,
          trade_time,
          fileDate: todayStr,
        };
      });

      const inserted = await TradeFile.insertMany(transformedTodayData);
      insertedCount += inserted.length;
      insertedData = insertedData.concat(inserted);
      console.log("Today FO file:", insertedCount);
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

// export const TradeFileData = async (req, res) => {
//   try {
//     const baseDir = process.env.FILE_PATH || "./data";
//     const today = new Date();
//     const todayStr = formatDate(today);
//     const latestPrevDate = getLatestFileDate(baseDir);
//     const previousFileDate = latestPrevDate ? prevformatDate(latestPrevDate) : null;

//     const todayFilePath = path.join(baseDir, `TradeFo_${todayStr}.txt`);
//     const previousFilePath = previousFileDate ? path.join(baseDir, `Position_NCL_FO_0_CM_06432_${previousFileDate}_F_0000.csv`) : null;
//     const custposFilePath = path.join(baseDir, `custpos.csv`);

//     const [prevData, todayData, newPrevData] = await Promise.all([
//       previousFileDate ? readFileAndParse(previousFilePath, previousFileDate, keys46) : [],
//       readFileAndParse(todayFilePath, todayStr, keys26),
//       readFileAndParse(custposFilePath, "custpos", keys37),
//     ]);

//     const validDates = [previousFileDate, todayStr].filter(Boolean);
//     await TradeFile.deleteMany({ $or: [{ fileDate: { $exists: false } }, { fileDate: { $nin: validDates } }] });

//     const cleanString = (s) => typeof s === "string" ? s.trim().replace(/\s+/g, " ") : s;

//     const buildBulkOps = (data, keys, dateStr) => {
//       return data.map(d => {
//         const t = Object.fromEntries(keys.map(k => [k, cleanString(d[k])]));
//         const expiry = standardizeExpiry(d.expiry);
//         const quantity = (parseInt(d.quantity1) || 0) - (parseInt(d.quantity2) || 0);
//         return {
//           updateOne: {
//             filter: {
//               master_id: cleanString(d.master_id),
//               symbol: cleanString(d.symbol),
//               strike_price: cleanString(d.strike_price),
//               expiry,
//               fileDate: dateStr,
//             },
//             update: { $set: { ...t, expiry, quantity, fileDate: dateStr } },
//             upsert: true,
//           },
//         };
//       });
//     };

//     let insertedCount = 0;

//     const prevBulkOps = buildBulkOps(prevData, keys46, previousFileDate);
//     const custBulkOps = buildBulkOps(newPrevData, keys37, "custpos");

//     if (prevBulkOps.length) {
//       const { upsertedCount, modifiedCount } = await TradeFile.bulkWrite(prevBulkOps);
//       insertedCount += (upsertedCount || 0) + (modifiedCount || 0);
//     }

//     if (custBulkOps.length) {
//       const { upsertedCount, modifiedCount } = await TradeFile.bulkWrite(custBulkOps);
//       insertedCount += (upsertedCount || 0) + (modifiedCount || 0);
//     }

//     if (todayData.length > 0) {
//       const grouped = _.groupBy(todayData, item => [
//         cleanString(item.symbol),
//         standardizeExpiry(item.expiry),
//         cleanString(item.strike_price),
//         cleanString(item.master_id),
//         cleanString(item.option_type),
//       ].join("|"));

//       const bulkOps = Object.values(grouped).map(group => {
//         let buyQty = 0, sellQty = 0;
//         group.forEach(g => {
//           const q = parseInt(g.quantity) || 0;
//           const bs = Number(g.buy_sell);
//           if (bs === 1) buyQty += q;
//           else if (bs === 2) sellQty += q;
//         });

//         const netQty = buyQty - sellQty;
//         const g0 = group[0];
//         const expiry = standardizeExpiry(cleanString(g0.expiry));

//         return {
//           updateOne: {
//             filter: {
//               symbol: cleanString(g0.symbol),
//               expiry,
//               strike_price: cleanString(g0.strike_price),
//               master_id: cleanString(g0.master_id),
//               option_type: cleanString(g0.option_type),
//               fileDate: todayStr,
//             },
//             update: {
//               $set: {
//                 buy_quantity: buyQty,
//                 sell_quantity: sellQty,
//                 net_quantity: netQty,
//                 expiry,
//               },
//             },
//             upsert: true,
//           },
//         };
//       });

//       if (bulkOps.length) {
//         const { upsertedCount, modifiedCount } = await TradeFile.bulkWrite(bulkOps);
//         insertedCount += (upsertedCount || 0) + (modifiedCount || 0);
//       }
//     }

//     res.json({ inserted: insertedCount, keptDates: validDates });
//   } catch (error) {
//     console.error("Controller error:", error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

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

// before replicationPercentage  final

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
//     // console.log("Mappings found:", mappings);
//     // console.log("Minion IDs:", minionIdStrings);

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

//     // Build a map of minionId -> set of mapped masterIds
//     const minionToMastersMap = {};
//     mappings.forEach((mapping) => {
//       const minionId = mapping.minionId;
//       const masterId = mapping.masterId;
//       if (!minionToMastersMap[minionId]) {
//         minionToMastersMap[minionId] = new Set();
//       }
//       minionToMastersMap[minionId].add(masterId);
//     });

//     // Enrich minion data with corresponding master quantity (sum only mapped masters)
//     const enrichedMinionData = minionData.map((minion) => {
//       let totalMasterNetQty = 0;

//       const mappedMasters = minionToMastersMap[minion.master_id]
//       ? Array.from(minionToMastersMap[minion.master_id])
//       : [];

//       mappedMasters.forEach((masterId) => {
//         const key = `${masterId}_${minion.symbol}_${minion.strike_price}_${minion.expiry}_${minion.option_type}`;
//         totalMasterNetQty += masterMap[key] || 0;
//       });

//       console.log("mappedmasters",mappedMasters);
//       return {
//         ...minion,
//         master_net_quantity: totalMasterNetQty,
//       };
//     });

//     // Enrich master data with corresponding minion quantity (optional)
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

// -------------------------------with replicationPercentage update  and perfect code without neet and twelve digit----------------------------------------------------->>

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
//     const masterIdNums = masterIdStrings.map(String);
//     const minionIdNums = minionIdStrings.map(String);

//     // Aggregation pipeline function
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

//     // Create master quantity map
//     const masterMap = {};
//     masterData.forEach((m) => {
//       const key = `${m.master_id}_${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
//       masterMap[key] = m.total_quantity;
//     });

//     // Map minionId => [{ masterId, replicationPercentage }]
//     const minionMappingMap = {};
//     mappings.forEach(({ masterId, minionId, replicationPercentage }) => {
//       if (!minionMappingMap[minionId]) {
//         minionMappingMap[minionId] = [];
//       }
//       minionMappingMap[minionId].push({ masterId, replicationPercentage });
//     });
//     // console.log("minionMappingMap",minionMappingMap)

//     // Enrich minion data with replication-adjusted master_net_quantity
//     const enrichedMinionData = minionData.map((minion) => {
//       let totalMasterNetQty = 0;

//       const mappingEntries = minionMappingMap[minion.master_id] || [];

//       mappingEntries.forEach(({ masterId, replicationPercentage }) => {
//         const key = `${masterId}_${minion.symbol}_${minion.strike_price}_${minion.expiry}_${minion.option_type}`;
//         const masterQty = masterMap[key] || 0;
//         totalMasterNetQty += masterQty * (replicationPercentage || 1); // default to 1
//       });

//       return {
//         ...minion,
//         master_net_quantity: totalMasterNetQty,
//         replicationPercentages: mappingEntries.map(
//           (e) => e.replicationPercentage
//         ),
//       };
//     });

//     // Build minion data map to enrich masterData
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

// --------------------------------------------code updated with added master_id , master_neet and master_twelve------------------------------------------------------>>>>>>

export const getReconTradeData = async (req, res) => {
  try {
    const { masterTraderIds } = req.body;
    // console.log("Received body:", req.body);
    if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
      return res.status(400).json({ error: "No master IDs provided" });
    }

    const masterIdStrings = masterTraderIds.map(String);
    // Step 1: Fetch mappings using masterId field
    const mappings = await MappingForm.find({
      masterId: { $in: masterIdStrings },
    });
    const mappedMinionIds = mappings.map((m) => m.minionId);

    // Step 2: Collect all relevant IDs and find matching trade documents
    const allRelevantIds = [...masterIdStrings, ...mappedMinionIds];
    const tradeDocs = await TradeFile.find({
      $or: [
        { master_id: { $in: allRelevantIds } },
        { master_neet: { $in: allRelevantIds } },
        { master_twelve: { $in: allRelevantIds } },
      ],
    }).select("master_id master_neet master_twelve");

    // Step 3: Build reverse mapping of each possible ID to its actual field name (based on what matched)
    const idToFieldMap = new Map();
    tradeDocs.forEach((doc) => {
      if (doc.master_id)
        idToFieldMap.set(doc.master_id.toString(), "master_id");
      if (doc.master_neet)
        idToFieldMap.set(doc.master_neet.toString(), "master_neet");
      if (doc.master_twelve)
        idToFieldMap.set(doc.master_twelve.toString(), "master_twelve");
    });

    // Step 4: Aggregation with resolved_master_id assigned based on matching field
    const buildAggregationPipeline = (ids) => [
      {
        $match: {
          $or: [
            { master_id: { $in: ids } },
            { master_neet: { $in: ids } },
            { master_twelve: { $in: ids } },
          ],
        },
      },
      {
        $addFields: {
          resolved_master_id: {
            $switch: {
              branches: [
                { case: { $in: ["$master_id", ids] }, then: "$master_id" },
                { case: { $in: ["$master_neet", ids] }, then: "$master_neet" },
                {
                  case: { $in: ["$master_twelve", ids] },
                  then: "$master_twelve",
                },
              ],
              default: null,
            },
          },
        },
      },
      {
        $group: {
          _id: {
            master_id: "$resolved_master_id",
            symbol: "$symbol",
            strike_price: "$strike_price",
            expiry: "$expiry",
            option_type: "$option_type",
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
          earliest_trade_time: { $min: "$trade_time" },
      latest_trade_time: { $max: "$trade_time" }
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
          resolved_master_id: "$_id.master_id",
          symbol: "$_id.symbol",
          strike_price: "$_id.strike_price",
          expiry: "$_id.expiry",
          option_type: "$_id.option_type",
          total_buy_quantity: 1,
          total_sell_quantity: 1,
          total_quantity: 1,
          earliest_trade_time: 1,
      latest_trade_time: 1,
          actionType: 1,
        },
      },
    ];

    const [masterRaw, minionRaw] = await Promise.all([
      TradeFile.aggregate(buildAggregationPipeline(masterIdStrings)),
      TradeFile.aggregate(buildAggregationPipeline(mappedMinionIds)),
    ]);

    const masterMap = {};
    masterRaw.forEach((m) => {
      const key = `${m.resolved_master_id}_${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
      masterMap[key] = m.total_quantity;
    });

    const minionMappingMap = {};
    mappings.forEach(({ masterId, minionId, replicationPercentage }) => {
      if (!minionMappingMap[minionId]) minionMappingMap[minionId] = [];
      minionMappingMap[minionId].push({ masterId, replicationPercentage });
    });

    const enrichedMinionData = minionRaw.map((minion) => {
      let totalMasterNetQty = 0;
      const mappings = minionMappingMap[minion.resolved_master_id] || [];

      mappings.forEach(({ masterId, replicationPercentage }) => {
        const key = `${masterId}_${minion.symbol}_${minion.strike_price}_${minion.expiry}_${minion.option_type}`;
        const masterQty = masterMap[key] || 0;
        totalMasterNetQty += masterQty * (replicationPercentage || 1);
      });

      return {
        ...minion,
        master_net_quantity: totalMasterNetQty,
        replicationPercentages: mappings.map((e) => e.replicationPercentage),
      };
    });

    const minionMap = {};
    minionRaw.forEach((m) => {
      const key = `${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
      minionMap[key] = (minionMap[key] || 0) + m.total_quantity;
    });

    const enrichedMasterData = masterRaw.map((m) => {
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





// <<<<<<<<<<<<<<<<<---------------------------- UPDATED CODE WITH QUANTITIES FOUND IN MASTER BUT NOT IN MINION SOLVED CODE -------------------------------->>>>>>>>>>>>>>
 
// export const getReconTradeData = async (req, res) => {
//   try {
//     const { masterTraderIds } = req.body;
//     // console.log("Received body:", req.body);
//     if (!Array.isArray(masterTraderIds) || masterTraderIds.length === 0) {
//       return res.status(400).json({ error: "No master IDs provided" });
//     }

//     const masterIdStrings = masterTraderIds.map(String);

//     // Step 1: Fetch mappings using masterId field
//     const mappings = await MappingForm.find({
//       masterId: { $in: masterIdStrings },
//     });
//     const mappedMinionIds = mappings.map((m) => m.minionId);

//     // Step 2: Collect all relevant IDs and find matching trade documents
//     const allRelevantIds = [...masterIdStrings, ...mappedMinionIds];
//     const tradeDocs = await TradeFile.find({
//       $or: [
//         { master_id: { $in: allRelevantIds } },
//         { master_neet: { $in: allRelevantIds } },
//         { master_twelve: { $in: allRelevantIds } },
//       ],
//     }).select("master_id master_neet master_twelve");

//     // Step 3: Build reverse mapping of each possible ID to its actual field name (based on what matched)
//     const idToFieldMap = new Map();
//     tradeDocs.forEach((doc) => {
//       if (doc.master_id)
//         idToFieldMap.set(doc.master_id.toString(), "master_id");
//       if (doc.master_neet)
//         idToFieldMap.set(doc.master_neet.toString(), "master_neet");
//       if (doc.master_twelve)
//         idToFieldMap.set(doc.master_twelve.toString(), "master_twelve");
//     });

//     // Step 4: Aggregation with resolved_master_id assigned based on matching field
//     const buildAggregationPipeline = (ids) => [
//       {
//         $match: {
//           $or: [
//             { master_id: { $in: ids } },
//             { master_neet: { $in: ids } },
//             { master_twelve: { $in: ids } },
//           ],
//         },
//       },
//       {
//         $addFields: {
//           resolved_master_id: {
//             $switch: {
//               branches: [
//                 { case: { $in: ["$master_id", ids] }, then: "$master_id" },
//                 { case: { $in: ["$master_neet", ids] }, then: "$master_neet" },
//                 {
//                   case: { $in: ["$master_twelve", ids] },
//                   then: "$master_twelve",
//                 },
//               ],
//               default: null,
//             },
//           },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             master_id: "$resolved_master_id",
//             symbol: "$symbol",
//             strike_price: "$strike_price",
//             expiry: "$expiry",
//             option_type: "$option_type",
//           },
//           total_buy_quantity: { $sum: "$buy_quantity" },
//           total_sell_quantity: { $sum: "$sell_quantity" },
//           total_quantity: {
//             $sum: {
//               $add: [
//                 { $ifNull: ["$net_quantity", 0] },
//                 { $ifNull: ["$quantity", 0] },
//               ],
//             },
//           },
//           earliest_trade_time: { $min: "$trade_time" },
//           latest_trade_time: { $max: "$trade_time" },
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
//       {
//         $project: {
//           _id: 0,
//           resolved_master_id: "$_id.master_id",
//           symbol: "$_id.symbol",
//           strike_price: "$_id.strike_price",
//           expiry: "$_id.expiry",
//           option_type: "$_id.option_type",
//           total_buy_quantity: 1,
//           total_sell_quantity: 1,
//           total_quantity: 1,
//           earliest_trade_time: 1,
//           latest_trade_time: 1,
//           actionType: 1,
//         },
//       },
//     ];

//     const [masterRaw, minionRaw] = await Promise.all([
//       TradeFile.aggregate(buildAggregationPipeline(masterIdStrings)),
//       TradeFile.aggregate(buildAggregationPipeline(mappedMinionIds)),
//     ]);

//     // ---- Build fast lookup for master totals per (master_id + instrument key)
//     const masterMap = {};
//     // Also index masterRaw by master id to quickly iterate instruments per master
//     const masterByMasterId = {};
//     masterRaw.forEach((m) => {
//       const key = `${m.resolved_master_id}_${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
//       masterMap[key] = m.total_quantity;

//       if (!masterByMasterId[m.resolved_master_id]) {
//         masterByMasterId[m.resolved_master_id] = [];
//       }
//       masterByMasterId[m.resolved_master_id].push(m);
//     });

//     // Build minion -> [{masterId, replicationPercentage}, ...]
//     const minionMappingMap = {};
//     mappings.forEach(({ masterId, minionId, replicationPercentage }) => {
//       if (!minionMappingMap[minionId]) minionMappingMap[minionId] = [];
//       minionMappingMap[minionId].push({
//         masterId,
//         replicationPercentage,
//       });
//     });

//     // Build actual minion positions map: minionId -> { instrKey -> minionRow }
//     const minionActualByMinion = {};
//     minionRaw.forEach((row) => {
//       const minionId = row.resolved_master_id;
//       const instrKey = `${row.symbol}_${row.strike_price}_${row.expiry}_${row.option_type}`;
//       if (!minionActualByMinion[minionId]) minionActualByMinion[minionId] = {};
//       minionActualByMinion[minionId][instrKey] = row;
//     });

//     // Build expected master-weighted totals per minion: minionId -> { instrKey -> weightedMasterQty }
//     const expectedByMinion = {};
//     Object.keys(minionMappingMap).forEach((minionId) => {
//       const mappingsForMinion = minionMappingMap[minionId]; // array of {masterId, replicationPercentage}
//       if (!expectedByMinion[minionId]) expectedByMinion[minionId] = {};

//       mappingsForMinion.forEach(({ masterId, replicationPercentage }) => {
//         const rep = Number(replicationPercentage) || 1;

//         const mastersInstruments = masterByMasterId[masterId] || [];
//         mastersInstruments.forEach((m) => {
//           const instrKey = `${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
//           const weighted = (expectedByMinion[minionId][instrKey] || 0) + (m.total_quantity || 0) * rep;
//           expectedByMinion[minionId][instrKey] = weighted;
//         });
//       });
//     });

//     // Enrich minion data:
//     // 1) Use existing minion rows.
//     // 2) Add synthetic rows where master has qty but minion doesn't (total_quantity: 0).
//     const enrichedMinionData = [];

//     // Make sure we include minions that appear either in minionRaw or in mappings
//     const allMinionIdsSet = new Set([
//       ...mappedMinionIds.map(String),
//       ...Object.keys(minionActualByMinion),
//       ...Object.keys(expectedByMinion),
//     ]);

//     allMinionIdsSet.forEach((minionId) => {
//       const actualMap = minionActualByMinion[minionId] || {};
//       const expectedMap = expectedByMinion[minionId] || {};

//       const unionInstrKeys = new Set([
//         ...Object.keys(actualMap),
//         ...Object.keys(expectedMap),
//       ]);

//       const repList = (minionMappingMap[minionId] || []).map((e) => e.replicationPercentage);

//       unionInstrKeys.forEach((instrKey) => {
//         const actual = actualMap[instrKey]; // may be undefined
//         const [symbol, strike_price, expiry, option_type] = instrKey.split("_");

//         if (actual) {
//           // existing minion row: just attach computed master_net_quantity (fallback 0)
//           let totalMasterNetQty = 0;
//           const mappingsForThisMinion = minionMappingMap[minionId] || [];
//           mappingsForThisMinion.forEach(({ masterId, replicationPercentage }) => {
//             const k = `${masterId}_${actual.symbol}_${actual.strike_price}_${actual.expiry}_${actual.option_type}`;
//             const masterQty = masterMap[k] || 0;
//             totalMasterNetQty += masterQty * (Number(replicationPercentage) || 1);
//           });

//           enrichedMinionData.push({
//             ...actual,
//             master_net_quantity: totalMasterNetQty || 0,
//             replicationPercentages: repList,
//           });
//         } else {
//           // synthetic row for master-only instrument
//           const masterWeighted = expectedMap[instrKey] || 0;

//           enrichedMinionData.push({
//             resolved_master_id: minionId,
//             symbol,
//             strike_price: isNaN(Number(strike_price)) ? strike_price : Number(strike_price),
//             expiry,
//             option_type,
//             total_buy_quantity: 0,
//             total_sell_quantity: 0,
//             total_quantity: 0,
//             earliest_trade_time: null,
//             latest_trade_time: null,
//             actionType: "sell", // keeps your previous logic: total_quantity === 0 => "sell"
//             master_net_quantity: masterWeighted || 0,
//             replicationPercentages: repList,
//           });
//         }
//       });
//     });

//     // ---- Existing logic for masterData enrichment (minion_net_quantity sum per instrument)
//     const minionMap = {};
//     minionRaw.forEach((m) => {
//       const key = `${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
//       minionMap[key] = (minionMap[key] || 0) + m.total_quantity;
//     });

//     const enrichedMasterData = masterRaw.map((m) => {
//       const key = `${m.symbol}_${m.strike_price}_${m.expiry}_${m.option_type}`;
//       return {
//         ...m,
//         minion_net_quantity: minionMap[key] || 0, // ensure fallback to 0
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
