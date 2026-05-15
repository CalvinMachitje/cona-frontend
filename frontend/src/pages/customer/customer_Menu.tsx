// frontend/src/pages/customer/customer_Menu.tsx
import { useState, useEffect } from "react";
import { Plus, ShoppingCart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("cocktails");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("customer_token");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_URL}/customer/menu`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch menu");
        }

        const data = await res.json();

        // Ensure backend returned array
        if (Array.isArray(data)) {
          setMenuItems(data);
        } else if (Array.isArray(data.data)) {
          setMenuItems(data.data);
        } else {
          console.error("Unexpected menu response:", data);
          setMenuItems([]);
          setError("Invalid menu data received.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load menu.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [token]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => [...prev, { ...item }]);
  };

  const filteredItems = menuItems.filter(
    (item) => item.category?.toLowerCase() === activeCategory
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Loading menu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-display text-6xl text-white">Cona Menu</h1>
            <p className="text-zinc-400">
              Order directly to your table • Real-time
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900 px-6 py-3 rounded-2xl">
            <ShoppingCart size={28} />
            <span className="text-3xl font-display">{cart.length}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4">
          {["cocktails", "food", "bottle", "wine"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-10 py-4 rounded-2xl font-medium capitalize whitespace-nowrap transition ${
                activeCategory === cat
                  ? "bg-amber-500 text-black"
                  : "bg-zinc-900 border border-zinc-700 hover:border-zinc-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            No menu items found in this category.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-amber-500/50 transition"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6">
                  <div className="flex justify-between">
                    <h3 className="text-xl font-medium">{item.name}</h3>
                    <p className="text-amber-400 font-display">
                      R{item.price}
                    </p>
                  </div>

                  <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
                    {item.description}
                  </p>

                  <button
                    onClick={() => addToCart(item)}
                    className="mt-6 w-full bg-zinc-800 hover:bg-amber-500 hover:text-black py-4 rounded-2xl font-medium transition flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add to Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}