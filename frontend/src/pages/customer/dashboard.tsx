// frontend/src/pages/customer/dashboard.tsx
import { useState, useEffect } from "react";
import { 
  Calendar, Clock, Award, Users, ArrowRight, 
  Sparkles, Gift 
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("customer_token");

  useEffect(() => {
    const storedUser = localStorage.getItem("customer_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchDashboardData = async () => {
      try {
        const [bookingsRes, menuRes] = await Promise.all([
          fetch(`${API_URL}/customer/bookings`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/customer/menu`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const bookingsData = await bookingsRes.json();
        const menuData = await menuRes.json();

        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setMenuItems(Array.isArray(menuData) ? menuData : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const nextBooking = bookings.length > 0 
    ? bookings.sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())[0]
    : null;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return <div className="text-center py-20 text-zinc-400">Loading your dashboard...</div>;
  }

  return (
    <div className="space-y-12">
      {/* Hero Welcome */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-amber-500/10 h-80 flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(at_center,#ca8a0430_0%,transparent_70%)]" />
        
        <div className="relative z-10 px-12 max-w-2xl">
          <p className="text-amber-400 font-medium tracking-widest text-sm mb-2">CONA LOUNGE • JOHANNESBURG</p>
          <h1 className="font-display text-6xl leading-none mb-4">
            {greeting()},<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-white">
              {user?.full_name?.split(" ")[0] || "Valued Guest"}
            </span>
          </h1>
          <p className="text-xl text-zinc-400">Welcome back to your sanctuary of taste and atmosphere.</p>
        </div>

        <div className="absolute bottom-8 right-12">
          <div className="bg-black/70 backdrop-blur-xl px-6 py-4 rounded-2xl border border-amber-500/20">
            <div className="flex items-center gap-3">
              <Sparkles className="text-amber-400" />
              <div>
                <p className="text-xs text-zinc-400">LOYALTY TIER</p>
                <p className="font-display text-2xl text-amber-400">GOLD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <Award className="text-amber-400 mb-6" size={32} />
          <p className="text-5xl font-display tracking-tighter">1240</p>
          <p className="text-zinc-400 mt-1">Loyalty Points</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <Calendar className="text-rose-400 mb-6" size={32} />
          <p className="text-5xl font-display tracking-tighter">
            {nextBooking ? new Date(nextBooking.booking_date).getDate() : "—"}
          </p>
          <p className="text-zinc-400 mt-1">Next Reservation</p>
          {nextBooking && (
            <p className="text-sm mt-4 text-zinc-300">
              {new Date(nextBooking.booking_date).toLocaleDateString('en-US', { 
                weekday: 'long', month: 'short', day: 'numeric' 
              })} • {nextBooking.booking_time}
            </p>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <Users className="text-sky-400 mb-6" size={32} />
          <p className="text-5xl font-display tracking-tighter">47</p>
          <p className="text-zinc-400 mt-1">Guests Now</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Clock className="text-emerald-400" size={28} />
            </div>
            <div>
              <p className="text-4xl font-display text-emerald-400">{bookings.length}</p>
              <p className="text-zinc-400">Total Bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Booking */}
      {nextBooking && (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/20 rounded-3xl p-10">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1">
              <div className="uppercase tracking-[3px] text-amber-400 text-sm mb-3">YOUR NEXT EXPERIENCE</div>
              <h3 className="font-display text-4xl">Reservation Confirmed</h3>
              <div className="mt-8 space-y-4 text-lg">
                <div className="flex items-center gap-4">
                  <Calendar className="text-amber-400" />
                  <span>{new Date(nextBooking.booking_date).toLocaleDateString('en-US', { 
                    weekday: 'long', month: 'long', day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="text-amber-400" />
                  <span>{nextBooking.booking_time} • {nextBooking.guests} guests</span>
                </div>
              </div>
            </div>
            <Link 
              to="/member/my-bookings"
              className="px-12 py-6 bg-white text-black font-medium rounded-3xl hover:scale-105 transition flex items-center gap-3 text-lg"
            >
              Manage Booking <ArrowRight />
            </Link>
          </div>
        </div>
      )}

      {/* Recommended Items */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-4xl">Recommended for You</h2>
          <Link to="/member/menu" className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm uppercase tracking-widest">
            Full Menu <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {menuItems.slice(0, 3).map((item: any) => (
            <div key={item.id} className="group bg-zinc-900 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all border border-transparent hover:border-amber-500/30">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="w-full h-52 object-cover" />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-xl">{item.name}</h4>
                  <span className="font-display text-amber-400">R{item.price}</span>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2 mt-2">{item.description}</p>
                
                <button className="mt-6 w-full py-4 bg-zinc-800 group-hover:bg-amber-500 group-hover:text-black rounded-2xl transition font-medium">
                  Add to Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
        <h3 className="font-display text-3xl mb-8">What would you like to do?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <LinkCard icon={Calendar} label="Book a Table" to="/member/book-table" color="rose" />
          <LinkCard icon={Gift} label="View Promotions" to="/member/promotions" color="amber" />
          <LinkCard icon={Award} label="My Rewards" to="/member/rewards" color="emerald" />
          <LinkCard icon={Users} label="My Bookings" to="/member/my-bookings" color="violet" />
        </div>
      </div>
    </div>
  );
}

// Reusable Link Card
function LinkCard({ icon: Icon, label, to, color }: { 
  icon: any; label: string; to: string; color: string;
}) {
  const colorMap: any = {
    rose: "hover:bg-rose-500/10 border-rose-500/20",
    amber: "hover:bg-amber-500/10 border-amber-500/20",
    violet: "hover:bg-violet-500/10 border-violet-500/20",
    emerald: "hover:bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <Link
      to={to}
      className={`group border border-zinc-800 hover:border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all ${colorMap[color]}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition">
        <Icon size={32} className={`text-${color}-400`} />
      </div>
      <p className="font-medium text-center">{label}</p>
    </Link>
  );
}