// frontend/src/pages/customer/activeOrders.tsx
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ActiveOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("customer_token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/customer/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        // ✅ SAFE GUARD: ensures array always
        const safeOrders = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setOrders(safeOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_URL, token]);

  return (
    <div className="min-h-screen bg-zinc-950 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-5xl mb-12">Active Orders</h1>

        {loading ? (
          <p className="text-zinc-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            No active orders at the moment.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-xl font-medium">
                      {order.items || "No items"}
                    </p>
                    <p className="text-zinc-400">
                      Table {order.table_number || "N/A"}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-emerald-400 font-medium">
                      {order.status?.toUpperCase() || "UNKNOWN"}
                    </div>
                    <div className="text-sm text-zinc-500 mt-1">
                      {order.estimated_ready || ""}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}