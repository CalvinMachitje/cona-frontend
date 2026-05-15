// frontend/src/pages/public/Register.tsx
import { motion } from "framer-motion";
import { useState } from "react";
import { User, Mail, Phone, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const payload = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
    };

    // Client-side validation
    if (formData.get("password") !== formData.get("confirm_password")) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Registration failed");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6">
        <div className="text-center max-w-md">
          <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
          <h1 className="font-display text-5xl mb-4 text-white">Account Created!</h1>
          <p className="text-zinc-400 mb-8">
            Welcome to Cona Lounge.<br />
            You can now sign in with your credentials.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-10 py-4 rounded-lg font-semibold tracking-wider hover:bg-primary/90 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-6xl text-white mb-3">Join Cona</h1>
          <p className="text-zinc-400 text-lg">
            Become a member and unlock exclusive experiences
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="Full Name" name="full_name" type="text" icon={User} placeholder="John Doe" required />
            <Field label="Email Address" name="email" type="email" icon={Mail} placeholder="you@example.com" required />
            <Field label="Phone Number" name="phone" type="tel" icon={Phone} placeholder="+27 60 123 4567" required />
            <Field label="Password" name="password" type="password" icon={Lock} placeholder="••••••••" required />
            <Field label="Confirm Password" name="confirm_password" type="password" icon={Lock} placeholder="••••••••" required />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 transition text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-70"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-zinc-500 mt-8 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <Link
          to="/"
          className="flex items-center justify-center gap-2 text-zinc-500 hover:text-white mt-8 transition"
        >
          <ArrowLeft size={16} /> Back to Homepage
        </Link>
      </motion.div>
    </div>
  );
}

// Reusable Field Component
function Field({ label, name, type, icon: Icon, placeholder, required }: any) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-2">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        )}
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-4 pl-11 pr-4 text-white focus:outline-none focus:border-primary transition placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
}