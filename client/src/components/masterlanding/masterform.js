import React, { useState } from "react";

const Masterform = ({ master={}, onSave, onClose }) => {
  const [formData , setFormData] = useState({
    masterName: master.masterName || "",
    masterTraderId: master.masterTraderId || "",
  });

  const [errors, setErrors] = useState({});

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const validate = () => {
    const newErrors = {};   
    if (!formData.masterName.trim()) newErrors.masterName = "Master name is required";
    if (!formData.masterTraderId.trim()) newErrors.masterTraderId = "Master trader id is required";
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
        Master User Details
      </h3>
      <form>
        <div className="m-3">
          <div className="p-4">
            <label>Enter Master Name: </label>
            <input className="border ml-2" name="masterName" required value={formData.masterName} onChange={handleChange}/>
          </div>
          {errors.masterName && <p className="text-red-500">{errors.masterName}</p>}
          <div className="p-4">
            <label>Enter Master Trader Id: </label>
            <input className="border ml-2" name="masterTraderId" required value={formData.masterTraderId} onChange={handleChange}/>
          </div>
          {errors.masterTraderId && <p className="text-red-500">{errors.masterTraderId}</p>}
          <div className="mt-4">
            <button
              className="text-white bg-[#586f80] rounded-md text-lg p-0.5 w-32 mr-4"
              type="button"
              onClick={handleSave}
            >
              {master._id ? "Update" : "Create"}
            </button>
            <button
              className="text-white bg-[#586f80] rounded-md text-lg p-0.5 w-32 "
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

export default Masterform;
