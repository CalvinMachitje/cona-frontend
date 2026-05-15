// frontend/src/pages/admin/dashboard.tsx

import { useEffect, useState } from "react";
import axios from "axios";

type DashboardStats = {
  total_users: number;
  total_bookings: number;
  total_payments: number;
  revenue: number;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
        "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-zinc-800 rounded" />
          <div className="h-24 bg-zinc-800 rounded" />
          <div className="h-24 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded">
          {error}
        </div>

        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-white text-black rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 text-white space-y-6">

      <h1 className="text-3xl font-bold">
        CONA Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-sm text-zinc-400">Total Users</p>
          <h2 className="text-2xl font-bold">{data.total_users}</h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-sm text-zinc-400">Bookings</p>
          <h2 className="text-2xl font-bold">{data.total_bookings}</h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-sm text-zinc-400">Payments</p>
          <h2 className="text-2xl font-bold">{data.total_payments}</h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-sm text-zinc-400">Revenue</p>
          <h2 className="text-2xl font-bold">
            R {data.revenue.toLocaleString()}
          </h2>
        </div>

      </div>

      {/* Refresh Button */}
      <div>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition"
        >
          Refresh Stats
        </button>
      </div>

    </div>
  );
}
