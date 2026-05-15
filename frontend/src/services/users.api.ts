// frontend/src/services/users.api.ts

import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
});

export const fetchUsers = async () => {
  const res = await axios.get(`${API}/admin/users`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const updateUser = async (id: string, payload: any) => {
  const res = await axios.patch(
    `${API}/admin/users/${id}`,
    payload,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await axios.delete(`${API}/admin/users/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
