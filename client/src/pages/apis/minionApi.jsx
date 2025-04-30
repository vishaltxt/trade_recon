import axios from "axios";

// Get token from localStorage or cookies (adjust based on your storage method)
const getAuthToken = () => {
  return localStorage.getItem('token'); // Change as needed
};

const API_BASE = "http://localhost:8000/api/minion"; // Use base URL for convenience

export const getMinions = () => {
  const token = getAuthToken();
  // console.log(token)
  return axios.get(`${API_BASE}/minions`, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

export const createMinions = (data) => {
  const token = getAuthToken();
  // console.log(data)
  return axios.post(`${API_BASE}/add-minions`, data, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

export const updateMinions = (id, data) => {
  const token = getAuthToken();
  return axios.put(`${API_BASE}/update-minions/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

export const deleteMinions = (id) => {
  const token = getAuthToken();
  return axios.delete(`${API_BASE}/delete-minions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};