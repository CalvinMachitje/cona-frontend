// frontend/src/pages/customer/rewards.tsx
import { useState, useEffect } from "react";
import { Award, Gift } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Rewards() {
  const [loyalty, setLoyalty] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("customer_token");

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/customer/profile`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/customer/rewards`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()) // ← New endpoint needed
    ])
      .then(([profile, rewardsData]) => {
        setLoyalty(profile);
        setRewards(rewardsData || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-400">Loading your rewards...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="font-display text-6xl">Loyalty Rewards</h1>
          <p className="text-zinc-400">Your points and exclusive perks</p>
        </div>
        <div className="text-right">
          <Award className="text-amber-400 mx-auto mb-2" size={48} />
          <p className="text-6xl font-display text-amber-400">{loyalty?.loyalty_points || 0}</p>
          <p className="text-emerald-400">{loyalty?.tier || "Member"} Member</p>
        </div>
      </div>

      <h2 className="font-display text-4xl mb-8">Available Rewards</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {rewards.length > 0 ? (
          rewards.map((item: any) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-amber-500/30 transition">
              <Gift className="text-amber-400 mb-6" size={36} />
              <h3 className="text-2xl font-medium">{item.name}</h3>
              <p className="text-zinc-400 mt-2">{item.description}</p>

              <div className="mt-6 flex justify-between items-end">
                <span className="text-4xl font-display text-amber-400">{item.points_required}</span>
                <button className="px-8 py-4 bg-zinc-800 hover:bg-amber-500 hover:text-black rounded-2xl transition">
                  Redeem
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-2 text-center py-20 text-zinc-400">No rewards available yet.</p>
        )}
      </div>
    </div>
  );
}