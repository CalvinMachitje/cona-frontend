// frontend/src/pages/admin/users.tsx

import { useEffect, useState } from "react";
import {
  fetchUsers,
  updateUser,
  deleteUser,
} from "@/services/users.api";

type User = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "customer";
  status: "active" | "suspended";
  created_at: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await updateUser(id, { role });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, role: role as any } : u
        )
      );
    } catch (err) {
      console.error("Role update failed", err);
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "suspended" : "active";

    try {
      await updateUser(id, { status: newStatus });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: newStatus as any } : u
        )
      );
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <div className="text-zinc-400">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Users</h1>

        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded">
          {error}
        </div>

        <button
          onClick={loadUsers}
          className="mt-4 px-4 py-2 bg-white text-black rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-6">

      <h1 className="text-3xl font-bold">Users</h1>

      <div className="overflow-x-auto border border-zinc-800 rounded-xl">

        <table className="w-full text-left">

          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-zinc-800 hover:bg-zinc-900/50"
              >

                <td className="p-3">
                  <div>
                    <p className="font-semibold">{u.full_name}</p>
                    <p className="text-sm text-zinc-400">{u.email}</p>
                  </div>
                </td>

                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={(e) =>
                      handleRoleChange(u.id, e.target.value)
                    }
                    className="bg-zinc-800 border border-zinc-700 p-1 rounded"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      u.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>

                <td className="p-3 text-sm text-zinc-400">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>

                <td className="p-3 space-x-2">

                  <button
                    onClick={() => toggleStatus(u.id, u.status)}
                    className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                  >
                    Toggle
                  </button>

                  <button
                    onClick={() => handleDelete(u.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}
