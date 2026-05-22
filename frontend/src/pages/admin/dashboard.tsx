// frontend/src/pages/admin/dashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
      const { data: stats, error } = await supabase.functions.invoke("get-dashboard-stats");
      if (error) throw error;

      setData(stats);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-white">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-white">
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded">{error}</div>
        <button onClick={fetchDashboard} className="mt-4 px-4 py-2 bg-white text-black rounded">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-sm text-zinc-400">Total Users</p>
          <h2 className="text-4xl font-bold mt-3">{data?.total_users}</h2>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-sm text-zinc-400">Total Bookings</p>
          <h2 className="text-4xl font-bold mt-3">{data?.total_bookings}</h2>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-sm text-zinc-400">Total Payments</p>
          <h2 className="text-4xl font-bold mt-3">{data?.total_payments}</h2>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-sm text-zinc-400">Total Revenue</p>
          <h2 className="text-4xl font-bold mt-3">R {data?.revenue.toLocaleString()}</h2>
        </div>
      </div>
    </div>
  );
}