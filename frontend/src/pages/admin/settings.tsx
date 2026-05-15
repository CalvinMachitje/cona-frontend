// frontend/src/pages/admin/settings.tsx

import { useEffect, useState } from "react";
import {
  fetchSettings,
  updateSetting,
} from "@/services/settings.api";

type Setting = {
  key: string;
  value: string;
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
      const data = await fetchSettings();
      setSettings(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
        "Failed to load settings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.key === key ? { ...s, value } : s
      )
    );
  };

  const handleSave = async (key: string) => {
    const setting = settings.find((s) => s.key === key);
    if (!setting) return;

    setSavingKey(key);

    try {
      await updateSetting(key, setting.value);
    } catch (err) {
      console.error("Failed to save setting", err);
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <div className="text-zinc-400">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>

        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded">
          {error}
        </div>

        <button
          onClick={loadSettings}
          className="mt-4 px-4 py-2 bg-white text-black rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-6">

      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="space-y-4">

        {settings.map((s) => (
          <div
            key={s.key}
            className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl"
          >

            <div className="w-1/3">
              <p className="font-semibold text-white">
                {s.key}
              </p>
            </div>

            <input
              value={s.value}
              onChange={(e) =>
                handleChange(s.key, e.target.value)
              }
              className="w-1/2 bg-zinc-800 border border-zinc-700 p-2 rounded"
            />

            <button
              onClick={() => handleSave(s.key)}
              disabled={savingKey === s.key}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition disabled:opacity-50"
            >
              {savingKey === s.key ? "Saving..." : "Save"}
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}
