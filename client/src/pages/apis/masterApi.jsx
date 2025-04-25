// src/api/userApi.js
import axios from "axios";

const API_BASE = "http://localhost:8000/api/form/masters"; // update if needed

export const getMasters = () => axios.get(API_BASE);
export const createMasters = (data) => axios.post(API_BASE, data);
export const updateMasters = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deleteMasters = (id) => axios.delete(`${API_BASE}/${id}`);
