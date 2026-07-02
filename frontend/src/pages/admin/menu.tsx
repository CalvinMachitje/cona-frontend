// frontend/src/pages/admin/menu.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  X,
  Save,
  Upload,
  Image as ImageIcon,
  RefreshCw,
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

type MenuCategory = {
  id?: string;
  name: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  description?: string;
};

type SpecialImage = {
  id: string;
  image_url: string;
  sort_order: number;
  description?: string;
  is_active: boolean;
};

const defaultCategories = [
  "Signature Cocktails",
  "Shots & Shooters",
  "Spirits",
  "Wine",
  "Champagne & MCC",
  "Beer",
  "Starters",
  "Light Meals",
  "Mains",
  "Platters",
  "Desserts",
  "Soft Drinks & Ciders",
  "Hot Beverages",
  "General",
];

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [specialImages, setSpecialImages] = useState<SpecialImage[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState(false);
  const [uploadingSpecial, setUploadingSpecial] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSpecialsModal, setShowSpecialsModal] = useState(false);
  const [selectedCategoryForImage, setSelectedCategoryForImage] = useState<string>("");

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

  // Load Menu Items
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

  // Load Categories
  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      const catData = data || [];
      // Ensure all defaults exist
      const existingNames = new Set(catData.map((c) => c.name));
      const merged = [
        ...catData,
        ...defaultCategories
          .filter((name) => !existingNames.has(name))
          .map((name, idx) => ({
            name,
            sort_order: catData.length + idx,
            is_active: true,
          })),
      ];
      setCategories(merged);
    } catch (err) {
      console.error("Failed to load categories:", err);
      // Fallback
      setCategories(defaultCategories.map((name, i) => ({ name, sort_order: i, is_active: true })));
    }
  };

  // Load Special Images
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
    loadCategories();
    loadSpecialImages();
  }, [search, categoryFilter]);

  // Upload Item Image
  const uploadImage = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);
      setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
      alert("Item image uploaded successfully!");
    } catch (err: any) {
      alert("Item image upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Upload Category Image (NEW - Core Requirement)
  const uploadCategoryImage = async (file: File, categoryName: string) => {
    if (!file || !categoryName) return;
    setUploadingCategory(true);
    try {
      const sanitized = categoryName.toLowerCase().replace(/\s+/g, "-");
      const fileName = `category-${sanitized}-${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);

      const { error } = await supabase.from("categories").upsert({
        name: categoryName,
        image_url: data.publicUrl,
        is_active: true,
        sort_order: categories.find((c) => c.name === categoryName)?.sort_order || 0,
      });

      if (error) throw error;

      await loadCategories();
      alert(`Category image for "${categoryName}" uploaded successfully!`);
    } catch (err: any) {
      alert("Category image upload failed: " + err.message);
    } finally {
      setUploadingCategory(false);
      setSelectedCategoryForImage("");
    }
  };

  // Upload Special Image
  const uploadSpecialImage = async (file: File) => {
    setUploadingSpecial(true);
    try {
      const fileName = `special-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("menu-images")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);

      await supabase.from("special_images").insert({
        image_url: data.publicUrl,
        sort_order: specialImages.length + 1,
      });

      loadSpecialImages();
      alert("Special combo image uploaded!");
    } catch (err: any) {
      alert("Failed to upload special image: " + err.message);
    } finally {
      setUploadingSpecial(false);
    }
  };

  const deleteSpecialImage = async (id: string) => {
    if (!confirm("Delete this special combo image?")) return;
    await supabase.from("special_images").update({ is_active: false }).eq("id", id);
    loadSpecialImages();
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
    const body = editingItem
      ? { action, item: { ...payload, id: editingItem.id } }
      : { action, item: payload };

    try {
      const { error } = await supabase.functions.invoke("manage-menu", { body });
      if (error) throw error;

      alert(editingItem ? "Menu item updated successfully!" : "Menu item created successfully!");
      loadMenu();
      resetForm();
    } catch (err: any) {
      alert("Error saving item: " + err.message);
    }
  };

  const resetForm = () => {
    setForm({
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
    if (!confirm("Delete this menu item?")) return;
    try {
      await supabase.functions.invoke("manage-menu", { body: { action: "delete", id } });
      loadMenu();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const togglePublish = async (item: MenuItem) => {
    try {
      await supabase.functions.invoke("manage-menu", {
        body: { action: "update", item: { ...item, is_published: !item.is_published } },
      });
      loadMenu();
    } catch (err: any) {
      alert("Failed to update: " + err.message);
    }
  };

  if (loading) return <div className="p-6 text-white">Loading menu data...</div>;

  return (
    <div className="p-6 text-white space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Menu Management</h1>
          <p className="text-zinc-400 mt-1">Manage categories, items & visuals for Cona Lounge</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 border border-amber-400 text-amber-400 rounded-xl hover:bg-amber-400/10"
          >
            <ImageIcon size={18} />
            Manage Categories
          </button>
          <button
            onClick={() => setShowSpecialsModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 border border-amber-400 text-amber-400 rounded-xl hover:bg-amber-400/10"
          >
            <ImageIcon size={18} />
            Special Combos
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200"
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
            className="w-full bg-zinc-900 border border-zinc-700 pl-11 py-3 rounded-xl focus:border-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 px-5 py-3 rounded-xl focus:border-white"
        >
          {["All", ...categories.map((c) => c.name)].map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Menu Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
            {item.image_url && <img src={item.image_url} className="w-full h-48 object-cover" />}
            <div className="p-5">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-sm text-zinc-400">
                {item.category} • R{item.price}
              </p>
              <div className="flex gap-2 mt-6">
                <button onClick={() => handleEdit(item)} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl">Edit</button>
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

      {/* Add/Edit Item Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </h2>

            {/* Form fields remain similar with improved category selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input placeholder="Item Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-white" />
              <input placeholder="Price (ZAR) *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-white" />
            </div>

            <input placeholder="Cost Price (Optional)" type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-white mb-4" />

            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl h-24 border border-zinc-700 focus:border-white mb-4" />

            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-2">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full p-3 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-white">
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Item Image Upload */}
            <div className="mb-6">
              <label className="block text-sm text-zinc-400 mb-2">Item Image (Optional - for featured items)</label>
              <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-zinc-500 transition">
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="hidden" id="menu-image-upload" />
                <label htmlFor="menu-image-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-10 h-10 text-zinc-400 mb-2" />
                  <span className="text-white font-medium">Click to upload image</span>
                </label>
              </div>
              {uploading && <p className="text-amber-400 mt-2 text-center">Uploading...</p>}
              {form.image_url && (
                <div className="mt-4">
                  <img src={form.image_url} alt="Preview" className="w-48 h-48 object-cover rounded-xl border border-zinc-700" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-6 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                Featured Item
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                Published
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.show_on_public} onChange={(e) => setForm({ ...form, show_on_public: e.target.checked })} />
                Show on Public Menu
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleSubmit} className="flex-1 bg-white text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200">
                <Save size={18} /> {editingItem ? "Update Item" : "Create Item"}
              </button>
              <button onClick={resetForm} className="flex-1 py-3 border border-zinc-700 rounded-xl hover:bg-zinc-800">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal (NEW) */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-4xl p-8 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Categories & Images</h2>
              <button onClick={() => setShowCategoryModal(false)}><X size={24} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <div key={cat.name} className="border border-zinc-700 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-xl">{cat.name}</h3>
                  </div>
                  {cat.image_url && <img src={cat.image_url} className="w-full h-48 object-cover rounded-xl mb-4" />}
                  
                  <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setSelectedCategoryForImage(cat.name);
                          uploadCategoryImage(e.target.files[0], cat.name);
                        }
                      }}
                      className="hidden"
                      id={`cat-upload-${cat.name}`}
                    />
                    <label htmlFor={`cat-upload-${cat.name}`} className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                      <span className="text-sm">Upload / Replace Category Image</span>
                    </label>
                  </div>
                  {uploadingCategory && selectedCategoryForImage === cat.name && <p className="text-amber-400 text-center mt-2">Uploading...</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Special Combos Modal (unchanged) */}
      {showSpecialsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-4xl p-8 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Special Combos Images</h2>
              <button onClick={() => setShowSpecialsModal(false)}><X size={24} /></button>
            </div>

            <div className="mb-8">
              <label className="block text-sm text-zinc-400 mb-3">Upload New Special Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && uploadSpecialImage(e.target.files[0])}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl"
              />
              {uploadingSpecial && <p className="text-amber-400 mt-3">Uploading...</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {specialImages.map((img) => (
                <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-zinc-700">
                  <img src={img.image_url} className="w-full h-64 object-cover" />
                  <button onClick={() => deleteSpecialImage(img.id)} className="absolute top-3 right-3 bg-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={18} />
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