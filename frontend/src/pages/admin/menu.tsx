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
  Save,
  Upload,
  Image as ImageIcon,
  Edit3,
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

type SpecialImage = {
  id: string;
  image_url: string;
  sort_order: number;
  description?: string;
  is_active: boolean;
};

const defaultCategories = [
  "Signature Cocktails", "Shots & Shooters", "Spirits", "Wine",
  "Champagne & MCC", "Beer", "Starters", "Light Meals", "Mains",
  "Platters", "Desserts", "Soft Drinks & Ciders", "Hot Beverages", "General",
];

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [specialImages, setSpecialImages] = useState<SpecialImage[]>([]);
  const [availableCategories] = useState(defaultCategories);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingSpecial, setUploadingSpecial] = useState(false);

  const [showSpecialsModal, setShowSpecialsModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    cost_price: "",
    image_url: "",
    category: "Signature Cocktails",
    is_featured: false,
    is_published: true,
    show_on_public: true,
    sort_order: "0",
  });

  // Load Data
  const loadMenu = async () => {
    setLoading(true);
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
      setError(err.message || "Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialImages = async () => {
    const { data } = await supabase
      .from("special_images")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    setSpecialImages(data || []);
  };

  useEffect(() => {
    loadMenu();
    loadSpecialImages();
  }, [search, categoryFilter]);

  // Image Uploads
  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return alert("Please upload a valid image");
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("menu-images").upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);
      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => setForm(prev => ({ ...prev, image_url: "" }));

  const uploadMultipleSpecialImages = async (files: FileList) => {
    setUploadingSpecial(true);
    let count = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      try {
        const fileName = `special-${Date.now()}-${i}-${file.name}`;
        const { error } = await supabase.storage.from("menu-images").upload(fileName, file, { upsert: true });
        if (error) continue;
        const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);
        await supabase.from("special_images").insert({
          image_url: data.publicUrl,
          sort_order: specialImages.length + count + 1,
        });
        count++;
      } catch (e) {}
    }
    await loadSpecialImages();
    setUploadingSpecial(false);
    if (count > 0) alert(`${count} special image(s) uploaded successfully!`);
  };

  const deleteSpecialImage = async (id: string) => {
    if (!confirm("Delete this special image?")) return;
    await supabase.from("special_images").update({ is_active: false }).eq("id", id);
    await loadSpecialImages();
  };

  // Improved handleSubmit
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("Item name is required");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      alert("Valid price is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      cost_price: Number(form.cost_price || 0),
      image_url: form.image_url || null,
      category: form.category,
      is_featured: form.is_featured,
      is_published: form.is_published,
      show_on_public: form.show_on_public,
      sort_order: Number(form.sort_order || 0),
    };

    const action = editingItem ? "update" : "create";
    const body = editingItem
      ? { action, item: { ...payload, id: editingItem.id } }
      : { action, item: payload };

    try {
      const { data, error } = await supabase.functions.invoke("manage-menu", { body });
      if (error) throw error;
      if (data?.success === false) throw new Error(data.error || "Operation failed");

      await loadMenu();
      alert(editingItem ? "Menu item updated successfully!" : "Menu item created successfully!");
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save menu item");
    }
  };

  const resetForm = () => {
    setForm({
      name: "", description: "", price: "", cost_price: "", image_url: "",
      category: "Signature Cocktails", is_featured: false, is_published: true,
      show_on_public: true, sort_order: "0",
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
    if (!confirm("Delete this menu item permanently?")) return;
    try {
      await supabase.functions.invoke("manage-menu", { body: { action: "delete", id } });
      await loadMenu();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const togglePublish = async (item: MenuItem) => {
    try {
      await supabase.functions.invoke("manage-menu", {
        body: { action: "update", item: { ...item, is_published: !item.is_published } },
      });
      await loadMenu();
    } catch (err: any) {
      alert("Failed to update publish status");
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-10 text-red-400">Error: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Header - Highly Visible Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold">Menu Management</h1>
          <p className="text-zinc-400">Add, edit, remove items and manage special deals</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSpecialsModal(true)}
            className="flex items-center gap-2 px-6 py-3 border border-amber-400 text-amber-400 rounded-2xl hover:bg-amber-400/10 transition"
          >
            <ImageIcon size={20} /> Special Deals
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition"
          >
            <Plus size={22} /> Add New Item
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
            className="w-full bg-zinc-900 border border-zinc-700 pl-11 py-3 rounded-2xl focus:border-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 px-6 py-3 rounded-2xl focus:border-white"
        >
          {["All", ...defaultCategories].map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Menu Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
            <h3 className="text-2xl font-semibold mb-3">No Menu Items Found</h3>
            <p className="text-zinc-400 mb-6">Get started by adding your first menu item.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-black px-8 py-3 rounded-2xl font-semibold hover:bg-gray-100"
            >
              Add First Menu Item
            </button>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all">
              {item.image_url?.trim() && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-52 object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
              <div className="p-6">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <span className="text-amber-400 font-medium">R{item.price}</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">{item.category}</p>

                <div className="grid grid-cols-3 gap-3 mt-8">
                  <button onClick={() => handleEdit(item)} className="py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl flex items-center justify-center gap-2">
                    <Edit3 size={18} /> Edit
                  </button>
                  <button onClick={() => togglePublish(item)} className="py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl">
                    {item.is_published ? <Eye size={20} className="mx-auto" /> : <EyeOff size={20} className="mx-auto" />}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-2xl">
                    <Trash2 size={20} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
          <div className="bg-zinc-900 rounded-3xl w-full max-w-2xl p-8 max-h-[92vh] overflow-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-zinc-800 rounded-xl">
                <X size={28} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Item Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-4 bg-zinc-800 rounded-2xl border border-zinc-700" placeholder="Item name" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Price (ZAR) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full p-4 bg-zinc-800 rounded-2xl border border-zinc-700" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-4 bg-zinc-800 rounded-2xl h-28 border border-zinc-700" />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Item Image</label>
                <div className="border-2 border-dashed border-zinc-700 rounded-3xl p-8 text-center">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="hidden" id="menu-image-upload" />
                  <label htmlFor="menu-image-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-12 h-12 text-zinc-400 mb-3" />
                    <span className="font-medium">Upload Image</span>
                  </label>
                </div>
                {form.image_url && (
                  <div className="mt-4 flex items-center gap-4">
                    <img src={form.image_url} alt="Preview" className="w-40 h-40 object-cover rounded-2xl" />
                    <button onClick={removeImage} className="text-red-400">Remove</button>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={handleSubmit} className="flex-1 bg-white text-black py-4 rounded-2xl font-semibold text-lg">
                  <Save className="inline mr-2" size={20} />
                  {editingItem ? "Update Item" : "Create Item"}
                </button>
                <button onClick={resetForm} className="flex-1 py-4 border border-zinc-700 rounded-2xl text-lg">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Special Deals Modal */}
      {showSpecialsModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
          <div className="bg-zinc-900 rounded-3xl w-full max-w-6xl p-8 max-h-[92vh] overflow-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Special Deals Images</h2>
              <button onClick={() => setShowSpecialsModal(false)}><X size={28} /></button>
            </div>

            <div className="border-2 border-dashed border-amber-400 rounded-3xl p-12 text-center mb-10">
              <input type="file" multiple accept="image/*" onChange={(e) => e.target.files && uploadMultipleSpecialImages(e.target.files)} className="hidden" id="special-upload" />
              <label htmlFor="special-upload" className="cursor-pointer">
                <Upload className="mx-auto w-16 h-16 text-amber-400 mb-4" />
                <p className="text-xl">Upload Multiple Special Images</p>
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {specialImages.map((img) => (
                <div key={img.id} className="relative group rounded-3xl overflow-hidden border border-zinc-700">
                  <img src={img.image_url} className="w-full aspect-square object-cover" />
                  <button onClick={() => deleteSpecialImage(img.id)} className="absolute top-4 right-4 bg-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}