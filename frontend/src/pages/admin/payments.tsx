// frontend/src/pages/admin/payments.tsx

import { useEffect, useState } from "react";
import {
  fetchPayments,
  fetchPaymentSummary,
} from "@/services/payments.api";

type Payment = {
  id: string;
  customer_name: string;
  amount: number;
  status: "success" | "failed" | "pending";
  method: string;
  created_at: string;
};

type Summary = {
  total_revenue: number;
  total_payments: number;
  successful: number;
  failed: number;
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const [paymentData, summaryData] = await Promise.all([
        fetchPayments(),
        fetchPaymentSummary(),
      ]);

      setPayments(paymentData);
      setSummary(summaryData);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
        "Failed to load payments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Payments</h1>
        <div className="text-zinc-400">Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Payments</h1>

        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded">
          {error}
        </div>

        <button
          onClick={loadPayments}
          className="mt-4 px-4 py-2 bg-white text-black rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-6">

      <h1 className="text-3xl font-bold">Payments</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <p className="text-sm text-zinc-400">Revenue</p>
            <h2 className="text-2xl font-bold">
              R {summary.total_revenue.toLocaleString()}
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <p className="text-sm text-zinc-400">Total Payments</p>
            <h2 className="text-2xl font-bold">
              {summary.total_payments}
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <p className="text-sm text-green-400">Successful</p>
            <h2 className="text-2xl font-bold text-green-400">
              {summary.successful}
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <p className="text-sm text-red-400">Failed</p>
            <h2 className="text-2xl font-bold text-red-400">
              {summary.failed}
            </h2>
          </div>

        </div>
      )}

      {/* Payments Table */}
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
              <tr
                key={p.id}
                className="border-t border-zinc-800 hover:bg-zinc-900/50"
              >

                <td className="p-3 font-semibold">
                  {p.customer_name}
                </td>

                <td className="p-3">
                  R {p.amount.toFixed(2)}
                </td>

                <td className="p-3 text-zinc-400">
                  {p.method}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      p.status === "success"
                        ? "bg-green-500/20 text-green-400"
                        : p.status === "failed"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {p.status}
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
