// frontend/src/pages/admin/menu.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Settings,
  X,
} from "lucide-react";

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  is_available: boolean;
  is_featured: boolean;
  is_published: boolean;
  show_on_public: boolean;
  sort_order: number;
  cost_price?: number;
};

type CategoryCount = {
  category: string;
  count: number;
};

const defaultCategories = [
  "Cocktails", "Food", "Bottle Service", "Wine", "Beer", "Shots", "Desserts", "General"
];

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    cost_price: "",
    image_url: "",
    category: "Cocktails",
    is_featured: false,
    is_published: true,
    show_on_public: true,
    sort_order: "0",
  });

  const loadMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("manage-menu", {
        body: {
          action: "get",
          search: search || undefined,
          category: categoryFilter === "All" ? undefined : categoryFilter,
        },
      });

      if (error) throw error;
      setItems(data?.data ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryStats = async () => {
    try {
      const { data } = await supabase
        .from("menu_items")
        .select("category")
        .is("deleted_at", null);

      const counts: Record<string, number> = {};
      data?.forEach(item => {
        counts[item.category] = (counts[item.category] || 0) + 1;
      });

      const formatted = Object.entries(counts).map(([category, count]) => ({
        category,
        count,
      }));

      setCategoryCounts(formatted);
    } catch (err) {
      console.error("Failed to load category stats", err);
    }
  };

  useEffect(() => {
    loadMenu();
    loadCategoryStats();
  }, [search, categoryFilter]);

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("menu-images")
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);
    setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      alert("Name and Price are required");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      cost_price: Number(form.cost_price || 0),
      image_url: form.image_url || null,
      category: form.category,
      is_featured: form.is_featured,
      is_published: form.is_published,
      show_on_public: form.show_on_public,
      sort_order: Number(form.sort_order),
    };

    const action = editingItem ? "update" : "create";
    const body = editingItem 
      ? { action, item: { ...payload, id: editingItem.id } } 
      : { action, item: payload };

    const { error } = await supabase.functions.invoke("manage-menu", { body });

    if (!error) {
      loadMenu();
      loadCategoryStats();
      resetForm();
    } else {
      alert("Error: " + error.message);
    }
  };

  const resetForm = () => {
    setForm({
      name: "", description: "", price: "", cost_price: "", image_url: "",
      category: "Cocktails", is_featured: false, is_published: true,
      show_on_public: true, sort_order: "0"
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      cost_price: String(item.cost_price || ""),
      image_url: item.image_url || "",
      category: item.category,
      is_featured: item.is_featured,
      is_published: item.is_published,
      show_on_public: item.show_on_public ?? true,
      sort_order: String(item.sort_order),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Move this item to trash?")) return;
    await supabase.functions.invoke("manage-menu", { body: { action: "delete", id } });
    loadMenu();
    loadCategoryStats();
  };

  const togglePublish = async (item: MenuItem) => {
    await supabase.functions.invoke("manage-menu", {
      body: { action: "update", item: { ...item, is_published: !item.is_published } }
    });
    loadMenu();
  };

  const addNewCategory = async () => {
    if (!newCategory.trim()) return alert("Category name cannot be empty");

    // Note: You may need to update the CHECK constraint in your DB manually
    alert(`New category "${newCategory}" added to form. You may need to update CHECK constraint in Supabase if you want to save items with this category.`);

    setForm(prev => ({ ...prev, category: newCategory.trim() }));
    setNewCategory("");
    setShowCategoryModal(false);
  };

  if (loading) return <div className="p-6 text-white">Loading menu...</div>;

  return (
    <div className="p-6 text-white space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 border border-zinc-700 rounded-xl hover:bg-zinc-800"
          >
            <Settings size={18} />
            Manage Categories
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium"
          >
            <Plus size={20} />
            Add New Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 pl-11 py-3 rounded-xl"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 px-5 py-3 rounded-xl"
        >
          {["All", ...defaultCategories].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* === ADD / EDIT FORM === */}
      {showForm && (
        <div className="bg-zinc-900 p-6 rounded-2xl space-y-5">
          <h2 className="text-2xl font-bold">
            {editingItem ? "Edit Menu Item" : "Create New Menu Item"}
          </h2>

          {/* Form fields - Full version */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Item Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl" />
            <input placeholder="Price (ZAR) *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl" />
          </div>

          <input placeholder="Cost Price (Optional)" type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl" />

          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl h-24" />

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl">
              {defaultCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Item Image</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="w-full p-3 bg-zinc-800 rounded-xl" />
            {uploading && <p className="text-amber-400">Uploading...</p>}
            {form.image_url && <img src={form.image_url} className="mt-3 w-40 h-40 object-cover rounded-xl" />}
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} /> Featured</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_published} onChange={e => setForm({...form, is_published: e.target.checked})} /> Published</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.show_on_public} onChange={e => setForm({...form, show_on_public: e.target.checked})} /> Show on Public Menu</label>
          </div>

          <button onClick={handleSubmit} className="w-full bg-white text-black py-3 rounded-xl font-semibold">
            {editingItem ? "Update Item" : "Create Item"}
          </button>
          <button onClick={resetForm} className="w-full py-3 border border-zinc-700 rounded-xl">Cancel</button>
        </div>
      )}

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <p className="text-xl">No menu items found</p>
          <p className="mt-2">Start by adding your first menu item</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-zinc-900 rounded-2xl overflow-hidden">
              {item.image_url && <img src={item.image_url} className="w-full h-48 object-cover" />}
              <div className="p-5">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-zinc-400">{item.category} • R{item.price}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleEdit(item)} className="flex-1 py-2 bg-zinc-800 rounded-xl">Edit</button>
                  <button onClick={() => togglePublish(item)} className="flex-1 py-2 bg-zinc-800 rounded-xl">
                    {item.is_published ? <Eye size={18} className="mx-auto" /> : <EyeOff size={18} className="mx-auto" />}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="flex-1 py-2 bg-red-900/30 text-red-400 rounded-xl">
                    <Trash2 size={18} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Categories</h2>
              <button onClick={() => setShowCategoryModal(false)}><X size={24} /></button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-3 bg-zinc-800 rounded-xl mb-3"
              />
              <button onClick={addNewCategory} className="w-full bg-amber-500 text-black py-3 rounded-xl font-medium">
                Add New Category
              </button>
            </div>

            <h3 className="font-medium mb-3">Current Categories</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {categoryCounts.length === 0 ? (
                <p className="text-zinc-400">No categories yet</p>
              ) : (
                categoryCounts.map(({ category, count }) => (
                  <div key={category} className="flex justify-between bg-zinc-800 p-3 rounded-xl">
                    <span>{category}</span>
                    <span className="text-zinc-400">{count} items</span>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-zinc-500 mt-6">
              Note: You may need to update the CHECK constraint in your database to allow new categories.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}