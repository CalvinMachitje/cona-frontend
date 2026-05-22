// frontend/src/pages/admin/register.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AdminRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Call the secure Edge Function instead of using service key directly
      const { data, error } = await supabase.functions.invoke("create-admin-user", {
        body: {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        },
      });

      if (error) throw error;

      console.log("Admin created successfully");
      setSuccess(true);

      setTimeout(() => navigate("/admin/login"), 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create admin account");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900 text-center">
          <h2 className="text-2xl font-bold text-green-500 mb-4">Success!</h2>
          <p className="text-zinc-400">Admin account has been created.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900 shadow-xl border border-zinc-800">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Admin Account</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Full Name</label>
            <input type="text" name="full_name" className="w-full mt-1 p-3 rounded bg-zinc-800 border border-zinc-700" value={formData.full_name} onChange={handleChange} required />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Email Address</label>
            <input type="email" name="email" className="w-full mt-1 p-3 rounded bg-zinc-800 border border-zinc-700" value={formData.email} onChange={handleChange} required />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Phone (Optional)</label>
            <input type="tel" name="phone" className="w-full mt-1 p-3 rounded bg-zinc-800 border border-zinc-700" value={formData.phone} onChange={handleChange} />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Password</label>
            <input type="password" name="password" className="w-full mt-1 p-3 rounded bg-zinc-800 border border-zinc-700" value={formData.password} onChange={handleChange} required />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Confirm Password</label>
            <input type="password" name="confirm_password" className="w-full mt-1 p-3 rounded bg-zinc-800 border border-zinc-700" value={formData.confirm_password} onChange={handleChange} required />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Admin Account"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link to="/admin/login" className="text-white hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}