// frontend/src/pages/admin/users.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Search,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Users as UsersIcon,
  Shield,
} from "lucide-react";

type User = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: "admin" | "staff" | "customer";
  status?: "active" | "suspended";
  created_at: string;
  deleted_at?: string | null;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [showStaff, setShowStaff] = useState(true);
  const [showCustomers, setShowCustomers] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "customer" as "admin" | "staff" | "customer",
  });

  // =========================
  // LOAD USERS
  // =========================
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "get" },
      });

      if (error) throw error;

      setUsers(data?.data || []);
    } catch (err: any) {
      console.error("LOAD USERS ERROR:", err);
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FILTERS
  // =========================
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return !user.deleted_at && matchesSearch;
  });

  const staffAndAdmins = filteredUsers.filter(
    (u) => u.role === "admin" || u.role === "staff"
  );

  const customers = filteredUsers.filter((u) => u.role === "customer");

  // =========================
  // CREATE USER
  // =========================
  const createUser = async () => {
    if (!newUser.full_name.trim() || !newUser.email.trim()) {
      alert("Full Name and Email are required");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: {
          action: "create",
          full_name: newUser.full_name.trim(),
          email: newUser.email.trim().toLowerCase(),
          phone: newUser.phone.trim() || null,
          role: newUser.role,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to create user");

      alert(
        `User created successfully.\n\nTemporary Password:\n${data?.temporary_password || "Check Supabase logs"}`
      );

      setShowAddModal(false);
      setNewUser({ full_name: "", email: "", phone: "", role: "customer" });
      await loadUsers();
    } catch (err: any) {
      alert(err?.message || "Failed to create user");
    }
  };

  // =========================
  // UPDATE ROLE
  // =========================
  const updateUserRole = async (id: string, newRole: "admin" | "staff" | "customer") => {
    try {
      const { error } = await supabase.functions.invoke("manage-users", {
        body: { action: "update-role", user_id: id, role: newRole },
      });

      if (error) throw error;
      await loadUsers();
    } catch (err: any) {
      alert("Failed to update role: " + err.message);
    }
  };

  // =========================
  // SOFT DELETE
  // =========================
  const openSoftDeleteModal = (user: User) => {
    setUserToDelete(user);
    setDeleteReason("");
    setShowDeleteModal(true);
  };

  const softDeleteUser = async () => {
    if (!userToDelete || !deleteReason.trim()) {
      alert("Please provide a reason for deletion");
      return;
    }

    try {
      const { error } = await supabase.functions.invoke("manage-users", {
        body: {
          action: "soft-delete",
          user_id: userToDelete.id,
          reason: deleteReason.trim(),
        },
      });

      if (error) throw error;

      setShowDeleteModal(false);
      setUserToDelete(null);
      setDeleteReason("");
      await loadUsers();
    } catch (err: any) {
      alert("Failed to delete user: " + err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) return <div className="p-6 text-white">Loading users...</div>;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl">{error}</div>
        <button onClick={loadUsers} className="mt-4 px-6 py-2 bg-white text-black rounded-xl">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">User Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200"
        >
          <Plus size={20} />
          Add New User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 pl-11 py-3 rounded-xl focus:border-white"
        />
      </div>

      {/* Staff & Admins Section */}
      <div className="border border-zinc-800 rounded-2xl overflow-hidden">
        <div
          className="bg-zinc-900 p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setShowStaff(!showStaff)}
        >
          <div className="flex items-center gap-3">
            <Shield size={24} className="text-white" />
            <h2 className="text-xl font-semibold">Staff & Admins ({staffAndAdmins.length})</h2>
          </div>
          {showStaff ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>

        {showStaff && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-950">
                <tr>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Phone</th>
                  <th className="p-4 text-left">Joined</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffAndAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-zinc-400">
                      No staff or admins found
                    </td>
                  </tr>
                ) : (
                  staffAndAdmins.map((user) => (
                    <tr key={user.id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-sm text-zinc-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1"
                        >
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm text-zinc-400">{user.phone || "—"}</td>
                      <td className="p-4 text-sm text-zinc-400">
                        {new Date(user.created_at).toLocaleDateString("en-ZA")}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => openSoftDeleteModal(user)}
                          className="p-2 hover:bg-red-900/30 text-red-400 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customers Section */}
      <div className="border border-zinc-800 rounded-2xl overflow-hidden">
        <div
          className="bg-zinc-900 p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setShowCustomers(!showCustomers)}
        >
          <div className="flex items-center gap-3">
            <UsersIcon size={24} className="text-white" />
            <h2 className="text-xl font-semibold">Customers ({customers.length})</h2>
          </div>
          {showCustomers ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>

        {showCustomers && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-950">
                <tr>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Phone</th>
                  <th className="p-4 text-left">Joined</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-zinc-400">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((user) => (
                    <tr key={user.id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-sm text-zinc-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize text-emerald-400">Customer</span>
                      </td>
                      <td className="p-4 text-sm text-zinc-400">{user.phone || "—"}</td>
                      <td className="p-4 text-sm text-zinc-400">
                        {new Date(user.created_at).toLocaleDateString("en-ZA")}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => openSoftDeleteModal(user)}
                          className="p-2 hover:bg-red-900/30 text-red-400 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New User</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
              />
              <input
                type="tel"
                placeholder="Phone Number (Optional)"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
              >
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>

              <button
                onClick={createUser}
                className="w-full bg-white text-black py-3 rounded-xl font-semibold mt-4 hover:bg-gray-200"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Soft Delete User</h2>
            <p className="text-zinc-400 mb-6">
              You are about to soft delete: <strong>{userToDelete.full_name}</strong>
            </p>
            <textarea
              placeholder="Reason for deletion (required)"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 h-32"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border border-zinc-700 rounded-xl hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={softDeleteUser}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}