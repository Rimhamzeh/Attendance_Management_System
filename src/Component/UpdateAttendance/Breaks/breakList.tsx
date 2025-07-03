import React from "react";

interface Break {
  id: string;
  start_time: string;
  end_time: string;
}

interface BreakListProps {
  breaks: Break[];
  editingBreakId: string | null;
  onEditClick: (id: string, start: string, end: string) => void;
  onDeleteClick: (id: string) => void;
  theme: string;
  formatTimeDisplay: (time: string) => string;
}

export default function BreakList({
  breaks,
  editingBreakId,
  onEditClick,
  onDeleteClick,
  theme,
  formatTimeDisplay,
}: BreakListProps) {
  const buttonClass = `px-3 py-1 rounded text-sm transition-colors ${
    theme === "dark"
      ? "bg-gray-600 hover:bg-gray-500 text-white"
      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
  }`;

  const dangerButtonClass = `px-3 py-1 rounded text-sm transition-colors ${
    theme === "dark"
      ? "bg-red-600 hover:bg-red-500 text-white"
      : "bg-red-500 hover:bg-red-600 text-white"
  }`;

  if (breaks.length === 0)
    return (
      <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
        No breaks added.
      </p>
    );

  return (
    <>
      {breaks.map((br) => {
        if (editingBreakId === br.id) return null; 

        const startTime = formatTimeDisplay(br.start_time.slice(0, 5));
        const endTime = formatTimeDisplay(br.end_time.slice(0, 5));

        return (
          <div
            key={br.id}
            className={`flex flex-col sm:flex-row justify-between items-center gap-2 p-2 rounded mb-2 last:mb-0 ${
              theme === "dark" ? "bg-gray-600" : "bg-gray-200"
            }`}
          >
            <span className="text-sm sm:text-base">
              {startTime} - {endTime}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEditClick(br.id, startTime, endTime)}
                className={buttonClass}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDeleteClick(br.id)}
                className={dangerButtonClass}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
