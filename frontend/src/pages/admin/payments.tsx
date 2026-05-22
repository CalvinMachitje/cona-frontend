// frontend/src/pages/admin/payments.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Payment = {
  id: string;
  amount: number;
  payment_status: string;
  payment_method?: string;
  created_at: string;
  bookings?: { guest_name: string };
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("manage-payments");

      if (error) throw error;
      setPayments(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Loading payments...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Payments</h1>
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded">{error}</div>
        <button onClick={loadPayments} className="mt-4 px-4 py-2 bg-white text-black rounded">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-6">
      <h1 className="text-3xl font-bold">Payments Overview</h1>

      <div className="overflow-x-auto border border-zinc-800 rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Method</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                <td className="p-3 font-semibold">{p.bookings?.guest_name || "N/A"}</td>
                <td className="p-3">R {p.amount.toFixed(2)}</td>
                <td className="p-3 text-zinc-400">{p.payment_method || "—"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    p.payment_status === "paid" ? "bg-green-500/20 text-green-400" :
                    p.payment_status === "failed" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {p.payment_status}
                  </span>
                </td>
                <td className="p-3 text-sm text-zinc-400">
                  {new Date(p.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}