// src/api/userApi.js
import axios from "axios";

const API_BASE = "http://localhost:8000/api/form/users"; // update if needed

export const getUsers = () => axios.get(API_BASE);
export const createUser = (data) => axios.post(API_BASE, data);
export const updateUser = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deleteUser = (id) => axios.delete(`${API_BASE}/${id}`);
