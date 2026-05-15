// frontend/src/services/bookings.api.ts
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
});

export const fetchBookings = async () => {
  const res = await axios.get(`${API}/admin/bookings`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const updateBookingStatus = async (id: string, status: string) => {
  const res = await axios.patch(
    `${API}/admin/bookings/${id}`,
    { status },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const deleteBooking = async (id: string) => {
  const res = await axios.delete(`${API}/admin/bookings/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
