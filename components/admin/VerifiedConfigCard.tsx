"use client";

import { Pencil, Trash2, GripVertical } from "lucide-react";
import type { VerifiedConfigurationRow } from "@/lib/admin/types";

interface VerifiedConfigCardProps {
  config: VerifiedConfigurationRow;
  onEdit: (config: VerifiedConfigurationRow) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export function VerifiedConfigCard({ config, onEdit, onToggleActive, onDelete }: VerifiedConfigCardProps) {
  return (
    <div className={`rounded-lg border bg-white p-4 transition-opacity ${!config.is_active ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-stone-900 truncate">{config.name}</h3>
            {config.seed_size === "both" ? (
              <>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                  6mm
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                  14mm
                </span>
              </>
            ) : (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                config.seed_size === "6mm"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}>
                {config.seed_size}
              </span>
            )}
          </div>
          {config.description && (
            <p className="text-sm text-stone-500 mt-1 line-clamp-2">{config.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
            <span>{config.active_rows} rows</span>
            <span>{config.config.rowDistance / 10}cm spacing</span>
            {config.config.workingWidth && (
              <span>{(config.config.workingWidth / 10).toFixed(0)}cm width</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <GripVertical className="w-4 h-4 text-stone-300" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <button
            onClick={() => onToggleActive(config.id, !config.is_active)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              config.is_active ? "bg-green-500" : "bg-stone-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                config.is_active ? "translate-x-4.5" : "translate-x-1"
              }`}
              style={{ transform: config.is_active ? "translateX(17px)" : "translateX(3px)" }}
            />
          </button>
          <span className="text-xs text-stone-500">{config.is_active ? "Active" : "Inactive"}</span>
        </label>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(config)}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(config.id)}
            className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
