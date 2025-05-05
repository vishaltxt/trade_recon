import { MappingForm } from "../../modals/formModels/mappingFormModel.js";

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
