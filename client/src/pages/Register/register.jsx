import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        role: "", // default public role
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(null);

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
        if (!formData.password.trim()) newErrors.password = "Password is required";
        if (!formData.role) newErrors.role = "Role is required";
        return newErrors;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const response = await axios.post("http://localhost:8000/api/auth/register", formData);
            setSuccess(response.data.msg);
            setFormData({
                firstname: "",
                lastname: "",
                email: "",
                password: "",
                role: "",
            });
            setErrors({});
        } catch (error) {
            setSuccess(null);
            const errorMsg = error.response?.data?.msg || "Registration failed";
            setErrors({ global: errorMsg });
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-cover bg-center bg-gray-50" style={{ backgroundImage: "url('/bg-bg.jpg')" }}>
            <form
                onSubmit={handleRegister}
                className="shadow-lg rounded bg-yellow-100 p-8 w-full max-w-md bg-opacity-90"
            >
                <h2 className="text-3xl font-semibold mb-6 text-center text-amber-300">Register</h2>

                {errors.global && (
                    <p className="text-red-500 text-center mb-4">{errors.global}</p>
                )}
                {success && (
                    <p className="text-green-600 text-center mb-4">{success}</p>
                )}

                <div className="mb-4">
                    <label className="block mb-1">First Name</label>
                    <input
                        type="text"
                        name="firstname"
                        className="w-full border rounded px-3 py-2"
                        value={formData.firstname}
                        onChange={handleChange}
                    />
                    {errors.firstname && <p className="text-red-500">{errors.firstname}</p>}
                </div>

                <div className="mb-4">
                    <label className="block mb-1">Last Name</label>
                    <input
                        type="text"
                        name="lastname"
                        className="w-full border rounded px-3 py-2"
                        value={formData.lastname}
                        onChange={handleChange}
                    />
                    {errors.lastname && <p className="text-red-500">{errors.lastname}</p>}
                </div>

                <div className="mb-4">
                    <label className="block mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        className="w-full border rounded px-3 py-2"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <p className="text-red-500">{errors.email}</p>}
                </div>

                <div className="mb-4">
                    <label className="block mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        className="w-full border rounded px-3 py-2"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && <p className="text-red-500">{errors.password}</p>}
                </div>
                <div className="mb-4">
                    <label>Roles: </label>
                    <select
                        className="w-full border rounded px-3 py-2"
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

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Register
                </button>
                <div>
                    <Link to="/login"><button className='text-blue-600 text-xl mt-3'>Login Here...</button></Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;
