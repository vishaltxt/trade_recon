import React, { useState } from "react";

const UserForm = ({ user = {}, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    email: user.email || "",
    password: "", // Leave blank for edit mode
    role: user.role || "reader",
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
    if (!formData.firstname.trim()) newErrors.firstname = "First name is required";
    if (!formData.lastname.trim()) newErrors.lastname = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim() && !user._id) newErrors.password = "Password is required";
    if (!formData.role) newErrors.role = "Role is required";
    return newErrors;
  };

  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formToSubmit = { ...formData };
    if (user._id && !formData.password.trim()) {
      delete formToSubmit.password; // Don't send empty password during edit
    }

    onSave(formToSubmit);
  };

  return (
    <div>
      <h3 className="mx-3 p-2 text-[#637f92] font-bold bg-[#f0f4f7]">
        User Details
      </h3>
      <form>
        <div className="m-3">
          <div className="p-4">
            <label>First Name: </label>
            <input
              className="border ml-6"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
            />
            {errors.firstname && <p className="text-red-500">{errors.firstname}</p>}
          </div>

          <div className="p-4">
            <label>Last Name: </label>
            <input
              className="border ml-6"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
            />
            {errors.lastname && <p className="text-red-500">{errors.lastname}</p>}
          </div>

          <div className="p-4">
            <label>Email: </label>
            <input
              className="border ml-16"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="text-red-500">{errors.email}</p>}
          </div>

          <div className="p-4">
            <label>Password: </label>
            <input
              className="border ml-8"
              type="password"
              name="password"
              value={formData.password}
              // placeholder={user._id ? "Leave blank to keep existing password" : ""}
              onChange={handleChange}
            />
            {errors.password && <p className="text-red-500">{errors.password}</p>}
          </div>

          <div className="p-4">
            <label>Roles: </label>
            <select
              className="border w-48 ml-14"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="reader">Reader</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="text-red-500">{errors.role}</p>}
          </div>

          <div className="mt-4">
            <button
              className="text-white bg-[#586f80] rounded-md text-lg p-0.5 w-32 mr-4"
              type="button"
              onClick={handleSave}
            >
              {user._id ? "Update" : "Create"}
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


