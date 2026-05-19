// frontend/src/types/admin.ts
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type Booking = {
  id: string;

  user_id?: string;

  guest_name: string;
  guest_email: string;
  guest_phone?: string;

  booking_date: string;
  start_time: string;
  end_time?: string;

  guests: number;

  status: BookingStatus;

  table_id?: string;

  special_requests?: string;

  created_at: string;
};