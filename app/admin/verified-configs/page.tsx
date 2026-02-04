"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import type { VerifiedConfigurationRow, VerifiedRowConfig, VerifiedSeedSize } from "@/lib/admin/types";
import { VerifiedConfigCard } from "@/components/admin/VerifiedConfigCard";
import { VerifiedConfigEditor } from "@/components/admin/VerifiedConfigEditor";

export default function VerifiedConfigsPage() {
  const [configs, setConfigs] = useState<VerifiedConfigurationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<VerifiedConfigurationRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchConfigs = async () => {
    try {
      const res = await fetch("/api/admin/verified-configs");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setConfigs(data);
    } catch {
      setError("Failed to load verified configurations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleCreate = async (data: {
    name: string;
    description: string | null;
    config: VerifiedRowConfig;
    seed_size: VerifiedSeedSize;
    active_rows: number;
  }) => {
    const res = await fetch("/api/admin/verified-configs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create");
    }
    const newConfig = await res.json();
    setConfigs(prev => [newConfig, ...prev]);
    setIsCreating(false);
  };

  const handleUpdate = async (data: {
    name: string;
    description: string | null;
    config: VerifiedRowConfig;
    seed_size: VerifiedSeedSize;
    active_rows: number;
  }) => {
    if (!editingConfig) return;
    const res = await fetch(`/api/admin/verified-configs/${editingConfig.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update");
    }
    const updated = await res.json();
    setConfigs(prev => prev.map(c => c.id === updated.id ? updated : c));
    setEditingConfig(null);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/admin/verified-configs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setConfigs(prev => prev.map(c => c.id === updated.id ? updated : c));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this verified configuration?")) return;
    const res = await fetch(`/api/admin/verified-configs/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setConfigs(prev => prev.filter(c => c.id !== id));
    }
  };

  // Show editor view
  if (isCreating || editingConfig) {
    return (
      <div className="max-w-7xl">
        <VerifiedConfigEditor
          initialConfig={editingConfig || undefined}
          onSave={editingConfig ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsCreating(false);
            setEditingConfig(null);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Verified Configurations</h1>
          <p className="text-sm text-stone-500 mt-1">
            Pre-configured row setups that users can select as presets
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Configuration
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 mb-6">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      ) : configs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-500">No verified configurations yet.</p>
          <p className="text-sm text-stone-400 mt-1">
            Click &quot;Add Configuration&quot; to create your first verified setup.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configs.map(config => (
            <VerifiedConfigCard
              key={config.id}
              config={config}
              onEdit={setEditingConfig}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
