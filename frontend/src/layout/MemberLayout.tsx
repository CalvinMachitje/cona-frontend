// frontend/src/layouts/MemberLayout.tsx
import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  Calendar, ShoppingBag, Award, User, LogOut, 
  Home, Gift, Clock 
} from "lucide-react";

export default function MemberLayout() {
  const [user, setUser] = useState<any>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1240);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("customer_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const navItems = [
    { path: "/member", label: "Dashboard", icon: Home },
    { path: "/member/menu", label: "Order Menu", icon: ShoppingBag },
    { path: "/member/book-table", label: "Book Table", icon: Calendar },
    { path: "/member/my-bookings", label: "My Bookings", icon: Calendar },
    { path: "/member/active-orders", label: "Active Orders", icon: Clock },
    { path: "/member/rewards", label: "Rewards", icon: Award },
    { path: "/member/promotions", label: "Promotions", icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <div className="w-72 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        <div className="p-8 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-red-500 rounded-2xl flex items-center justify-center text-3xl font-bold">
              C
            </div>
            <div>
              <h1 className="font-display text-3xl tracking-tight">Cona Lounge</h1>
              <p className="text-xs text-emerald-400">Member Portal</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-8">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-sm font-medium ${
                    isActive 
                      ? "bg-amber-500 text-black" 
                      : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <item.icon size={22} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-zinc-800">
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-full flex items-center justify-center gap-3 text-red-400 hover:text-red-500 py-4 rounded-2xl hover:bg-zinc-800 transition font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-10 py-5 flex items-center justify-between">
            <h2 className="text-2xl font-display tracking-tight">
              {navItems.find(item => item.path === location.pathname)?.label || "Member Portal"}
            </h2>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 bg-zinc-800 px-6 py-3 rounded-2xl">
                <Award className="text-amber-400" size={24} />
                <div>
                  <p className="text-sm text-zinc-400">Loyalty Points</p>
                  <p className="text-xl font-display text-amber-400">{loyaltyPoints.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">{user?.full_name || "Cona Member"}</p>
                  <p className="text-xs text-emerald-400">Gold Member</p>
                </div>
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center border border-zinc-600">
                  <User size={22} />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-10 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}