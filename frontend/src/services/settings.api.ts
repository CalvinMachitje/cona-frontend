// frontend/src/services/settings.api.ts

import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
});

export const fetchSettings = async () => {
  const res = await axios.get(`${API}/admin/settings`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const updateSetting = async (key: string, value: string) => {
  const res = await axios.patch(
    `${API}/admin/settings/${key}`,
    { value },
    { headers: getAuthHeaders() }
  );
  return res.data;
};
