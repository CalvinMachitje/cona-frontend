// frontend/src/pages/admin/menu.tsx

import { useEffect, useState } from "react";
import {
  fetchMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/services/menu.api";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
};

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
  });

  const loadMenu = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchMenu();
      setItems(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleCreate = async () => {
    try {
      const newItem = await createMenuItem({
        ...form,
        price: Number(form.price),
      });

      setItems((prev) => [newItem, ...prev]);

      setForm({
        name: "",
        description: "",
        price: "",
        image_url: "",
      });
    } catch (err) {
      console.error("Create failed", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMenuItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Menu</h1>
        <div className="text-zinc-400">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Menu</h1>

        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded">
          {error}
        </div>

        <button
          onClick={loadMenu}
          className="mt-4 px-4 py-2 bg-white text-black rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-8">

      <h1 className="text-3xl font-bold">Menu Management</h1>

      {/* CREATE FORM */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">

        <h2 className="text-xl font-semibold">Add Menu Item</h2>

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded"
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded"
        />

        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
          className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded"
        />

        <input
          placeholder="Image URL"
          value={form.image_url}
          onChange={(e) =>
            setForm({ ...form, image_url: e.target.value })
          }
          className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded"
        />

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-white text-black rounded"
        >
          Add Item
        </button>

      </div>

      {/* MENU GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {items.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
          >

            <img
              src={item.image_url}
              className="h-40 w-full object-cover"
            />

            <div className="p-4 space-y-2">

              <h3 className="text-lg font-semibold">
                {item.name}
              </h3>

              <p className="text-sm text-zinc-400">
                {item.description}
              </p>

              <p className="font-bold">
                R {item.price}
              </p>

              <button
                onClick={() => handleDelete(item.id)}
                className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
              >
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
