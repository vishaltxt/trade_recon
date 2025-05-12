import { MappingForm } from "../../modals/formModels/mappingFormModel.js";
import { MinionForm } from "../../modals/formModels/minionFormModel.js";

export const createMappings = async (req, res) => {
  try {
    const { masterId, minionId, replicationPercentage, toggle } = req.body;
    const newMapping = await MappingForm.create({
      masterId,
      minionId,
      replicationPercentage,
      toggle,
    });
    res.status(201).json(newMapping);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all mappings
export const getMappings = async (req, res) => {
  try {
    const mappings = await MappingForm.find();
    res.json(mappings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a mapping
export const updateMappings = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMapping = await MappingForm.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedMapping);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a mapping
export const deleteMappings = async (req, res) => {
  try {
    const { id } = req.params;
    await MappingForm.findByIdAndDelete(id);
    res.json({ message: "Mapping deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// code for Recon mappings to get minions based on masters selected checkboxes
export const getMinionsByMasterIds = async (req, res) => {
  try {
    const { masterIds } = req.body;

    if (!masterIds || !Array.isArray(masterIds) || masterIds.length === 0) {
      return res
        .status(400)
        .json({ error: "masterIds must be a non-empty array" });
    }

    // Fetch mappings for these masters
    const mappings = await MappingForm.find({ masterId: { $in: masterIds } });

    // Extract all unique minion codes (assuming string codes like "MIN001")
    const minionCodes = [...new Set(mappings.map((m) => m.minionId))];
    // console.log("Mapped minion IDs:", mappings.map((m) => m.minionId));
    
    
    if (minionCodes.length === 0) {
      return res.status(200).json(["no minions mapped"]);
    }
    
    // Fetch minions by TraderId
    const minions = await MinionForm.find({
      minionTraderId: { $in: minionCodes },
    });
    // console.log("Minions fetched:", minions.map(m => m.minionTraderId));

    res.status(200).json(minions);
  } catch (error) {
    console.error("Error in getMinionsByMasterIds:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
