// frontend/src/services/payments.api.ts

import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
});

export const fetchPayments = async () => {
  const res = await axios.get(`${API}/admin/payments`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchPaymentSummary = async () => {
  const res = await axios.get(`${API}/admin/payments/summary`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
