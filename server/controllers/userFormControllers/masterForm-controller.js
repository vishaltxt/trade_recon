import { MasterForm } from "../../modals/formModels/masterFormModel.js";

export const createMasters = async (req, res) => {
  try {
    const { masterName, masterTraderId } = req.body;
    const newMaster = new MasterForm({
      masterName,
      masterTraderId,
    });

    await newMaster.save();
    res.status(201).json(newMaster);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all masters
export const getMasters = async (req, res) => {
  try {
    const masters = await MasterForm.find();
    res.json(masters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a master
export const updateMasters = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMaster = await MasterForm.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedMaster);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a master
export const deleteMasters = async (req, res) => {
  try {
    const { id } = req.params;
    await MasterForm.findByIdAndDelete(id);
    res.json({ message: "Master deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
