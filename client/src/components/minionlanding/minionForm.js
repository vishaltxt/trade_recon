import React from "react";

const MinionForm = ({ user, onSave, onClose }) => {
  return (
    <div>
      <h3 className="mx-3 p-2 text-[#637f92] font-bold bg-[#f0f4f7]">
        Minion User Details
      </h3>
      <form>
        <div className="m-3">
          <div className="p-4">
            <label>Enter Minion Name: </label>
            <input className="border ml-2" defaultValue={user?.firstName || ""} />
          </div>
          <div className="p-4">
            <label>Enter Minion Trader Id: </label>
            <input className="border ml-2" defaultValue={user?.lastName || ""} />
          </div>
          <div className="p-4">
            <label>Enter Minion Client Code: </label>
            <input className="border ml-2" defaultValue={user?.email || ""} />
          </div>
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

export default MinionForm;
