import React from "react";

const Masterform = ({ user, onSave, onClose }) => {
  return (
    <div>
      <h3 className="mx-3 p-2 text-[#637f92] font-bold bg-[#f0f4f7]">
        Master User Details
      </h3>
      <form>
        <div className="m-3">
          <div className="p-4">
            <label>Enter Master Name: </label>
            <input className="border ml-2" defaultValue={user?.firstName || ""} />
          </div>
          <div className="p-4">
            <label>Enter Master Trader Id: </label>
            <input className="border ml-2" defaultValue={user?.lastName || ""} />
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

export default Masterform;
