import React, { useState } from "react";

const MinionForm = ({minion={}, user, onSave, onClose }) => {
    const [formData , setFormData] = useState({
      minionName: minion.minionName || "",
      minionTraderId: minion.minionTraderId || "",
      minionClientCode: minion.minionClientCode || "",
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
      if (!formData.minionName.trim()) newErrors.minionName = "Minion name is required";
      if (!formData.minionTraderId.trim()) newErrors.minionTraderId = "Minion trader id is required";
      if (!formData.minionClientCode.trim()) newErrors.minionClientCode = "Minion client code is required";
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
        Minion User Details
      </h3>
      <form>
        <div className="m-3">
          <div className="p-4">
            <label>Enter Minion Name: </label>
            <input className="border ml-2" name="minionName" required value={formData.minionName} onChange={handleChange} />
          </div>
          {errors.minionName && <p className="text-red-500">{errors.minionName}</p>}
          <div className="p-4">
            <label>Enter Minion Trader Id: </label>
            <input className="border ml-2" name="minionTraderId" required value={formData.minionTraderId} onChange={handleChange} />
          </div>
          {errors.minionTraderId && <p className="text-red-500">{errors.minionTraderId}</p>}
          <div className="p-4">
            <label>Enter Minion Client Code: </label>
            <input className="border ml-2" name="minionClientCode" required value={formData.minionClientCode} onChange={handleChange} />
          </div>
          {errors.minionClientCode && <p className="text-red-500">{errors.minionClientCode}</p>}
          <div className="p-4">
            <label>Enter Minion Server: </label>
            <select className="border w-56 p-1 ml-2">
              <option>http://103.69.168.20:3000</option>
            </select>
            {/* <input className="border" defaultValue={user?.email || ""} /> */}
          </div>
          <div className="mt-4">
            <button
              className="text-white bg-[#586f80] rounded-md text-lg p-0.5 w-32 mr-4"
              type="button"
              onClick={handleSave}
            >
              {minion._id ? "Update" : "Create"}
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

export default MinionForm;
