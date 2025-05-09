import { TradeFile } from "../../modals/tradeData/dataModel.js";

export const TradeFileData = async (req, res) => {
  try {
    const trades = await TradeFile.find().limit(100); // Add filters if required
    res.status(200).json(trades);
  } catch (error) {
    console.error("Error fetching trades:", error); // Better logging
    res.status(500).json({ message: "Unable to fetch data", error: error.message });
  }
};
