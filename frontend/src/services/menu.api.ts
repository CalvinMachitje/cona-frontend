// frontend/src/services/menu.api.ts

import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
});

export const fetchMenu = async () => {
  const res = await axios.get(`${API}/admin/menu`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const createMenuItem = async (data: any) => {
  const res = await axios.post(`${API}/admin/menu`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const updateMenuItem = async (id: string, data: any) => {
  const res = await axios.patch(
    `${API}/admin/menu/${id}`,
    data,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const deleteMenuItem = async (id: string) => {
  const res = await axios.delete(`${API}/admin/menu/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
