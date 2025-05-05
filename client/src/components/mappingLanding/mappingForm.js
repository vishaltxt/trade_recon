import React, { useEffect, useState } from "react";
import { getMasters } from "../../pages/apis/masterApi";
import { getMinions } from "../../pages/apis/minionApi";

const MappingForm = ({mapping = {} , onSave , onClose,}) => {
  const [masters, setMasters] = useState([]);
  const fetchMasters = async () => {
    try {
      const res = await getMasters();
      setMasters(res.data);
    } catch (error) {
      console.error("Error fetching masters:", error);
    }
  };

  const [minions, setMinions] = useState([]);
  const fetchMinions = async () => {
    try {
      const res = await getMinions();
      setMinions(res.data);
    } catch (error) {
      console.error("Error fetching minions:", error);
    }
  };

  useEffect(() => {
    fetchMasters();
    fetchMinions();
  }, []);

  const [formData, setFormData] = useState({
    masterId: mapping.masterId || "",
    minionId: mapping.minionId || "",
    replicationPercentage: mapping.replicationPercentage || "",
    toggle: mapping.toggle || "",
    // masterTraderId: master.masterTraderId || "",
    // minionTraderId: minion.minionTraderId || "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.masterId?.trim())
      newErrors.masterId = "Master ID is required";
    if (!formData.minionId?.trim())
      newErrors.minionId = "Minion ID is required";
    if (!formData.replicationPercentage)
      newErrors.replicationPercentage = "Replication percentage is required";
    if (!formData.toggle) newErrors.toggle = "Required";
    return newErrors;
  };
  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(formData);
  };

  return (
    <div>
      <h3 className="mx-3 p-2 text-[#637f92] font-bold bg-[#f0f4f7]">
        Mapping Details
      </h3>
      <form>
        <div className="m-3">
          <div className="p-4">
            <label>Select Master ID: </label>
            <select
              className="border ml-3 p-1"
              value={formData.masterId}
              name="masterId"
              onChange={handleChange}
            >
              <option value="">Click to select master id</option>
              {masters.map((master , index) => (
                <option key={master.id || index} value={master.value}>
                  {master.masterName}
                </option>
              ))}
            </select>
          </div>
          {errors.masterId && <p className="text-red-500">{errors.masterId}</p>}

          <div className="p-4">
            <label>Select Minion ID: </label>
            <select
              className="border ml-3 p-1"
              value={formData.minionId}
              name="minionId"
              onChange={handleChange}
            >
              <option value="">Click to select minion id</option>
              {minions.map((minion , index) => (
                <option key={minion.id || index} value={minion.value}>
                  {minion.minionTraderId}
                </option>
              ))}
            </select>
          </div>
          {errors.minionId && <p className="text-red-500">{errors.minionId}</p>}
          <div className="p-4">
            <label>Percentage for Replication: </label>
            <input
              className="border ml-3"
              type="number"
              value={formData.replicationPercentage}
              name="replicationPercentage"
              onChange={handleChange}
            />
          </div>
          {errors.replicationPercentage && (
            <p className="text-red-500">{errors.replicationPercentage}</p>
          )}
          <div className="p-4">
            <label>Toggle for Replication: </label>
            <input
              className="ml-3 w-4 h-4"
              type="checkbox"
              name="toggle"
              checked={formData.toggle}
              onChange={handleChange}
            />
          </div>
          {errors.toggle && <p className="text-red-500">{errors.toggle}</p>}
          <div className="mt-4">
            <button
              className="text-white bg-[#586f80] rounded-md text-lg p-0.5 w-32 mr-4"
              type="button"
              onClick={handleSave}
            >
              {mapping.masterId ? "Update" : "Create"}
            </button>
            <button
              className="text-white bg-[#586f80] rounded-md text-lg p-0.5 w-32"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MappingForm;
