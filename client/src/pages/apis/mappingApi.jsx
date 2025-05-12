import axios from "axios";

// Get token from localStorage or cookies (adjust based on your storage method)
const getAuthToken = () => {
  return localStorage.getItem('token'); // Change as needed
};

const API_BASE = "http://localhost:8000/api/mapping"; // Use base URL for convenience

export const getMappings = () => {
  const token = getAuthToken();
  // console.log(token)
  return axios.get(`${API_BASE}/mappings`, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

export const createMappings = (data) => {
  const token = getAuthToken();
  // console.log(data)
  return axios.post(`${API_BASE}/add-mappings`, data, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

export const updateMappings = (id, data) => {
  const token = getAuthToken();
  return axios.put(`${API_BASE}/update-mappings/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};

export const deleteMappings = (id) => {
  const token = getAuthToken();
  return axios.delete(`${API_BASE}/delete-mappings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}` // Include token in Authorization header
    }
  });
};


// POST: Get all minions mapped to given masterTraderIds
export const getMinionsByMasterIds = (masterIds) => {
  const token = getAuthToken();
  return axios.post(
    `${API_BASE}/get-minions-by-masterIds`,
    { masterIds },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
