import axios from "axios";

// Get token from localStorage or cookies (adjust based on your storage method)
const getAuthToken = () => {
  return localStorage.getItem('authToken'); // Change as needed
};

const API_BASE = "http://localhost:8000/api/users"; // Use base URL for convenience

export const getUsers = () => {
  const token = getAuthToken();
  return axios.get(`${API_BASE}/users`, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

export const createUser = (data) => {
  const token = getAuthToken();
  return axios.post(`${API_BASE}/add-user`, data, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

export const updateUser = (id, data) => {
  const token = getAuthToken();
  return axios.put(`${API_BASE}/update-user/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

export const deleteUser = (id) => {
  const token = getAuthToken();
  return axios.delete(`${API_BASE}/delete-user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

// src/api/userApi.js
// import axiosInstance from './axiosInstance'; // update the path as needed

// export const getUsers = () => axiosInstance.get('/users');
// export const createUser = (data) => axiosInstance.post('/add-user', data);
// export const updateUser = (id, data) => axiosInstance.put(`/update-user/${id}`, data);
// export const deleteUser = (id) => axiosInstance.delete(`/delete-user/${id}`);

// // // src/api/userApi.js
// import axios from "axios";

// const API_BASE = "http://localhost:8000/api/users"; // update if needed

// export const getUsers = () => axios.get("http://localhost:8000/api/users/users");
// export const createUser = (data) => axios.post("http://localhost:8000/api/users/add-user", data);
// export const updateUser = (id, data) => axios.put(`${"http://localhost:8000/api/users/update-user"}/${id}`, data);
// export const deleteUser = (id) => axios.delete(`${"http://localhost:8000/api/users/delete-user"}/${id}`);
