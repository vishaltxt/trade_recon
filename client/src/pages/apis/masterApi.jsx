import axios from "axios";

// Get token from localStorage or cookies (adjust based on your storage method)
const getAuthToken = () => {
  return localStorage.getItem('token'); // Change as needed
};

const API_BASE = "http://localhost:8000/api/master"; // Use base URL for convenience

export const getMasters = () => {
  const token = getAuthToken();
  // console.log(token)
  return axios.get(`${API_BASE}/masters`, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

export const createMasters = (data) => {
  const token = getAuthToken();
  // console.log(data)
  return axios.post(`${API_BASE}/add-masters`, data, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

export const updateMasters = (id, data) => {
  const token = getAuthToken();
  return axios.put(`${API_BASE}/update-masters/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

export const deleteMasters = (id) => {
  const token = getAuthToken();
  return axios.delete(`${API_BASE}/delete-masters/${id}`, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};
// // src/api/userApi.js
// import axios from "axios";

// const API_BASE = "http://localhost:8000/api/admin/masters"; // update if needed

// export const getMasters = () => axios.get(API_BASE);
// export const createMasters = (data) => axios.post(API_BASE, data);
// export const updateMasters = (id, data) => axios.put(`${API_BASE}/${id}`, data);
// export const deleteMasters = (id) => axios.delete(`${API_BASE}/${id}`);
