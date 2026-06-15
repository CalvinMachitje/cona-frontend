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
  const [availableCategories, setAvailableCategories] = useState<string[]>(defaultCategories);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingSpecial, setUploadingSpecial] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
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

  // Upload Image for Menu Item
  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("menu-images").upload(fileName, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);
      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (err: any) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => setForm(prev => ({ ...prev, image_url: "" }));

  // Upload Multiple Special Images
  const uploadMultipleSpecialImages = async (files: FileList) => {
    if (files.length === 0) return;
    setUploadingSpecial(true);
    let success = 0;

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
          sort_order: specialImages.length + success + 1,
        });
        success++;
      } catch (e) {
        console.error(e);
      }
    }

    await loadSpecialImages();
    setUploadingSpecial(false);
    if (success > 0) alert(`${success} image(s) uploaded successfully!`);
  };

  const deleteSpecialImage = async (id: string) => {
    if (!confirm("Delete this special image?")) return;
    await supabase.from("special_images").update({ is_active: false }).eq("id", id);
    await loadSpecialImages();
  };

  const handleSubmit = async () => {
    if (!form.name?.trim() || !form.price) {
      alert("Item name and price are required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
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
    const body = editingItem ? { action, item: { ...payload, id: editingItem.id } } : { action, item: payload };

    try {
      const { error } = await supabase.functions.invoke("manage-menu", { body });
      if (error) throw error;

      alert(editingItem ? "Menu item updated successfully!" : "Menu item created successfully!");
      await loadMenu();
      resetForm();
    } catch (err: any) {
      alert("Error saving item: " + err.message);
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
      alert("Failed to update: " + err.message);
    }
  };

  const addNewCategory = () => {
    if (!newCategory.trim() || availableCategories.includes(newCategory.trim())) return;
    const updated = [...availableCategories, newCategory.trim()].sort();
    setAvailableCategories(updated);
    setNewCategory("");
    setShowCategoryModal(false);
  };

  if (loading) return <div className="p-6 text-white">Loading menu management...</div>;
  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;

  return (
    <div className="p-6 text-white space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Menu Management</h1>
          <p className="text-zinc-400 mt-1">Manage items, pricing, images &amp; special deals</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 border border-zinc-400 text-zinc-400 rounded-xl hover:bg-zinc-800"
          >
            <Settings size={18} /> Categories
          </button>
          <button
            onClick={() => setShowSpecialsModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 border border-amber-400 text-amber-400 rounded-xl hover:bg-amber-400/10"
          >
            <ImageIcon size={18} /> Special Deals
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200"
          >
            <Plus size={20} /> Add New Item
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
            className="w-full bg-zinc-900 border border-zinc-700 pl-11 py-3 rounded-xl focus:border-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 px-5 py-3 rounded-xl focus:border-white"
        >
          {["All", ...availableCategories].map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Menu Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition">
            {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />}
            <div className="p-5">
              <div className="flex justify-between">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <span className="text-amber-400 font-medium">R{item.price}</span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">{item.category}</p>

              <div className="flex gap-2 mt-6">
                <button onClick={() => handleEdit(item)} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center gap-2">
                  <Edit3 size={16} /> Edit
                </button>
                <button onClick={() => togglePublish(item)} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl">
                  {item.is_published ? <Eye size={18} className="mx-auto" /> : <EyeOff size={18} className="mx-auto" />}
                </button>
                <button onClick={() => handleDelete(item.id)} className="flex-1 py-2.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-xl">
                  <Trash2 size={18} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </h2>

            {/* Form fields - same as before */}
            <div className="space-y-6">
              {/* Name & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Item Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-white" placeholder="Item name" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Price (ZAR) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-white" />
                </div>
              </div>

              {/* Cost Price & Description */}
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Cost Price (Optional)</label>
                <input type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-white" />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl h-24 border border-zinc-700 focus:border-white" placeholder="Description..." />
              </div>

              {/* Category & Image Upload */}
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-white">
                  {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Item Image</label>
                <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-zinc-500 transition">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="hidden" id="menu-image-upload" />
                  <label htmlFor="menu-image-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-10 h-10 text-zinc-400 mb-2" />
                    <span className="text-white font-medium">Upload Image</span>
                  </label>
                </div>
                {uploading && <p className="text-amber-400 mt-2">Uploading...</p>}
                {form.image_url && (
                  <div className="mt-4 flex items-center gap-4">
                    <img src={form.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-xl border border-zinc-700" />
                    <button onClick={removeImage} className="text-red-400 hover:text-red-500 flex items-center gap-1 text-sm">
                      <Trash2 size={16} /> Remove Image
                    </button>
                  </div>
                )}
              </div>

              {/* Checkboxes & Sort Order */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Published</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.show_on_public} onChange={(e) => setForm({ ...form, show_on_public: e.target.checked })} /> Show on Public Menu</label>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-white" />
              </div>
            </div>

            <div className="flex gap-3 pt-8">
              <button onClick={handleSubmit} className="flex-1 bg-white text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200">
                <Save size={18} /> {editingItem ? "Update Item" : "Create Item"}
              </button>
              <button onClick={resetForm} className="flex-1 py-3 border border-zinc-700 rounded-xl hover:bg-zinc-800">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Special Deals Modal - Multiple Upload */}
      {showSpecialsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-5xl p-8 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Special Deals Images</h2>
              <button onClick={() => setShowSpecialsModal(false)}><X size={24} /></button>
            </div>

            <div className="mb-8 border-2 border-dashed border-amber-400 rounded-2xl p-10 text-center hover:border-amber-500 transition">
              <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && uploadMultipleSpecialImages(e.target.files)} className="hidden" id="special-upload" />
              <label htmlFor="special-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-14 h-14 text-amber-400 mb-4" />
                <span className="text-lg font-medium">Upload Multiple Special Images</span>
                <span className="text-zinc-500">Click or select multiple files</span>
              </label>
              {uploadingSpecial && <p className="text-amber-400 mt-4">Uploading...</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {specialImages.map((img) => (
                <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-zinc-700">
                  <img src={img.image_url} className="w-full h-64 object-cover" alt="Special" />
                  <button onClick={() => deleteSpecialImage(img.id)} className="absolute top-3 right-3 bg-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold mb-6">Manage Categories</h2>
            <div className="flex gap-2 mb-6">
              <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category" className="flex-1 p-3 bg-zinc-800 rounded-xl border border-zinc-700" />
              <button onClick={addNewCategory} className="px-6 bg-white text-black rounded-xl">Add</button>
            </div>
            <ul className="space-y-2 max-h-60 overflow-auto">
              {availableCategories.map((cat, i) => <li key={i} className="bg-zinc-800 px-4 py-2 rounded-xl">{cat}</li>)}
            </ul>
            <button onClick={() => setShowCategoryModal(false)} className="mt-6 w-full py-3 border border-zinc-700 rounded-xl">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}