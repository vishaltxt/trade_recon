import React from "react";

const MappingForm = ({ user,  onSave, onClose }) => {
  return (
    <div>
      <h3 className="mx-3 p-2 text-[#637f92] font-bold bg-[#f0f4f7]">
      Mapping Details
      </h3>
      <form>
        <div className="m-3">
          <div className="p-4">
            <label>Select Master ID: </label>
            <input className="border ml-2" defaultValue={user?.firstName || ""} />
          </div>
          <div className="p-4">
            <label>Select Minion ID: </label>
            <input className="border ml-2" defaultValue={user?.lastName || ""} />
          </div>
          <div className="p-4">
            <label>Percentage for Replication: </label>
            <input className="border ml-2" defaultValue={user?.email || ""} />
          </div>
          <div className="p-4">
            <label>Toggle for Replication: </label>
            {/* <input className="border" defaultValue={user?.email || ""} /> */}
          </div>
          <div className="mt-4">
            <button
              className="text-white bg-[#586f80] rounded-md text-lg p-0.5 w-32 mr-4"
              type="button"
              onClick={onSave}
            >
              Create
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

export default MappingForm;
