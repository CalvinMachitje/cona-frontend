// frontend/src/pages/customer/promotions.tsx
import { useState, useEffect } from "react";
import { Gift, Calendar } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Promotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("customer_token");

  useEffect(() => {
    fetch(`${API_URL}/customer/promotions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPromotions(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-400">Loading offers...</p>;

  return (
    <div>
      <h1 className="font-display text-6xl mb-3">Exclusive Offers</h1>
      <p className="text-zinc-400 mb-12">Special promotions for Cona Lounge members</p>

      <div className="grid lg:grid-cols-3 gap-8">
        {promotions.length > 0 ? promotions.map((p: any) => (
          <div key={p.id} className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-amber-500/30 transition">
            {p.image_url && <img src={p.image_url} className="w-full h-64 object-cover" />}
            
            <div className="p-8">
              <h3 className="font-display text-3xl mb-3">{p.title}</h3>
              <p className="text-zinc-400">{p.description}</p>
              
              {p.valid_until && (
                <p className="text-xs text-zinc-500 mt-6 flex items-center gap-2">
                  <Calendar size={16} /> Until {new Date(p.valid_until).toLocaleDateString()}
                </p>
              )}

              <button className="mt-8 w-full py-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-2xl font-medium hover:brightness-110 transition">
                Claim Offer
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-3 py-20 text-center text-zinc-400">
            No active promotions at the moment.
          </div>
        )}
      </div>
    </div>
  );
}