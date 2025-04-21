import React, { useState } from "react";

const UserForm = ({ user = {}, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    password: user.password || "",
    role: user.role || "Reader",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div>
      <h3 className="mx-3 p-2 text-[#637f92] font-bold bg-[#f0f4f7]">User Details</h3>
      <form>
        <div className="m-3">
          <div className="p-4">
            <label>First Name: </label>
            <input
              className="border ml-6"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="p-4">
            <label>Last Name: </label>
            <input
              className="border ml-6"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="p-4">
            <label>Email: </label>
            <input
              className="border ml-16"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="p-4">
            <label>Password: </label>
            <input
              className="border ml-8"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="p-4">
            <label>Roles: </label>
            <select
              className="border w-48 ml-14"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Reader">Reader</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="mt-4">
            <button
              className="text-white bg-[#586f80] rounded-md text-lg p-0.5 w-32 mr-4"
              type="button"
              onClick={handleSave}
            >
              Create
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

export default UserForm;

// import React from "react";

// const UserForm = ({ user,  onSave, onClose }) => {
//   return (
//     <div>
//       <h3 className="mx-3 p-2 text-[#637f92] font-bold bg-[#f0f4f7]">
//         User Details
//       </h3>
//       <form>
//         <div className="m-3">
//           <div className="p-4">
//             <label>First Name: </label>
//             <input className="border ml-6" defaultValue={user?.firstName || ""} />
//           </div>
//           <div className="p-4">
//             <label>Last Name: </label>
//             <input className="border ml-6" defaultValue={user?.lastName || ""} />
//           </div>
//           <div className="p-4">
//             <label>Email: </label>
//             <input className="border ml-16" defaultValue={user?.email || ""} />
//           </div>
//           <div className="p-4">
//             <label>Password: </label>
//             <input className="border ml-8" defaultValue={user?.password || ""} />
//           </div>
//           <div className="p-4">
//             <label>Roles: </label>
//             {/* <input className="border" defaultValue={user?.email || ""} /> */}
//             <select className="border w-48 ml-14">
//               <option>Reader</option>
//               <option>Manager</option>
//               <option>Admin</option>
//             </select>
//           </div>
//           <div className="mt-4">
//             <button
//               className="text-white bg-[#586f80] rounded-md text-lg p-0.5 w-32 mr-4"
//               type="button"
//               onClick={onSave}
//             >
//               Create
//             </button>
//             <button
//               className="text-white bg-[#586f80] rounded-md text-lg p-0.5 w-32 "
//               type="button"
//               onClick={onClose}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default UserForm;
