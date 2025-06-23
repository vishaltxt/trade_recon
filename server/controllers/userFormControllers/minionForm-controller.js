import { MinionForm } from "../../modals/formModels/minionFormModel.js";

export const createMinions = async (req, res) => {
  try {
    const { minionName, minionTraderId,minionClientCode } = req.body;
    const newMinion = await MinionForm.create({
        minionName,
        minionTraderId,
        minionClientCode,
    });

    // await newMaster.save();
    res.status(201).json(newMinion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all masters
export const getMinions = async (req, res) => {
  try {
    const minions = await MinionForm.find();
    res.json(minions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a master
export const updateMinions = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMinion = await MinionForm.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedMinion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a master
export const deleteMinions = async (req, res) => {
  try {
    const { id } = req.params;
    await MinionForm.findByIdAndDelete(id);
    res.json({ message: "Master deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
