import React from "react";
import { IoCloseSharp } from "react-icons/io5";

interface BreakFormProps {
  breakData: { start: string; end: string };
  onChange: (field: "start" | "end", value: string) => void;
  onClear: (field: "start" | "end") => void;
  onCancel: () => void;
  onSave: () => void;
  theme: string;
  isEditing?: boolean;
}

export default function BreakForm({
  breakData,
  onChange,
  onClear,
  onCancel,
  onSave,
  theme,
  isEditing = false,
}: BreakFormProps) {
  const inputClass = `w-full px-3 py-2 rounded border transition-colors ${
    theme === "dark"
      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
      : "bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
  }`;

  const buttonClass = `px-3 py-1 rounded text-sm transition-colors ${
    theme === "dark"
      ? "bg-gray-600 hover:bg-gray-500 text-white"
      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
  }`;

  const primaryButtonClass = `px-3 py-1 rounded text-sm transition-colors ${
    theme === "dark"
      ? "bg-blue-600 hover:bg-blue-500 text-white"
      : "bg-blue-500 hover:bg-blue-600 text-white"
  }`;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2">
        {(["start", "end"] as const).map((field) => (
          <div key={field} className="relative flex-1">
            <input
              type="time"
              value={breakData[field]}
              onChange={(e) => onChange(field, e.target.value)}
              className={inputClass}
            />
            {breakData[field] && (
              <button
                type="button"
                onClick={() => onClear(field)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
              >
                <IoCloseSharp size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={buttonClass}>
          Cancel
        </button>
        <button type="button" onClick={onSave} className={primaryButtonClass}>
          {isEditing ? "Save" : "Add Break"}
        </button>
      </div>
    </div>
  );
}
