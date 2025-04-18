import React from "react";

const UserForm = ({ user, isCreateMode, onSave, onClose }) => {
  return (
    <div>
      <h3 className="mx-3 p-2 text-[#637f92] font-bold bg-[#f0f4f7]">
        {isCreateMode
          ? "User Details"
          : `Edit: ${user.firstName} ${user.lastName}`}
      </h3>
      <form>
        <div className="m-3">
          <div className="p-4">
            <label>First Name: </label>
            <input className="border" defaultValue={user?.firstName || ""} />
          </div>
          <div className="p-4">
            <label>Last Name: </label>
            <input className="border" defaultValue={user?.lastName || ""} />
          </div>
          <div className="p-4">
            <label>Email: </label>
            <input className="border" defaultValue={user?.email || ""} />
          </div>
          <div className="p-4">
            <label>Password: </label>
            <input className="border" defaultValue={user?.email || ""} />
          </div>
          <div className="p-4">
            <label>Roles: </label>
            <input className="border" defaultValue={user?.email || ""} />
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

export default UserForm;
