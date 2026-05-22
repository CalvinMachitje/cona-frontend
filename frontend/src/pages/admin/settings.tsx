// frontend/src/pages/admin/settings.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Setting = {
  key: string;
  value: any;
  updated_at: string;
};

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("manage-settings", {
        body: { action: "get" },
      });

      if (error) throw error;
      setSettings(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    setSavingKey(key);

    try {
      await supabase.functions.invoke("manage-settings", {
        body: { action: "update", key, value },
      });

      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value } : s))
      );
    } catch (err) {
      console.error("Failed to save setting", err);
    } finally {
      setSavingKey(null);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Loading settings...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded">{error}</div>
        <button onClick={loadSettings} className="mt-4 px-4 py-2 bg-white text-black rounded">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-6">
      <h1 className="text-3xl font-bold">System Settings</h1>

      <div className="space-y-4">
        {settings.map((s) => (
          <div key={s.key} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div className="w-1/3">
              <p className="font-semibold text-white">{s.key}</p>
            </div>

            <input
              value={typeof s.value === "object" ? JSON.stringify(s.value) : String(s.value)}
              onChange={(e) => {
                const newSettings = settings.map((item) =>
                  item.key === s.key ? { ...item, value: e.target.value } : item
                );
                setSettings(newSettings);
              }}
              className="w-1/2 bg-zinc-800 border border-zinc-700 p-2 rounded"
            />

            <button
              onClick={() => updateSetting(s.key, s.value)}
              disabled={savingKey === s.key}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 disabled:opacity-50"
            >
              {savingKey === s.key ? "Saving..." : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}